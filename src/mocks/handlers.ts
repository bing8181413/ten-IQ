import { delay, http, HttpResponse } from 'msw';
import { z } from 'zod';
import { mockRuntime } from '@/mock-backend/runtime';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const scenarioSchema = z.enum([
  'success',
  'slow',
  'empty',
  'server-error',
  'stale',
  'rate-limit',
  'malformed',
  'fail-first',
]);
const marketQuerySchema = z
  .object({
    category: z.string().optional(),
    status: z.enum(['open', 'live', 'resolved', 'closing']).optional(),
    sort: z.enum(['trending', 'volume', 'newest']).default('trending'),
    search: z.string().max(120).optional(),
    topic: z.string().max(80).optional(),
    cursor: z.string().min(1).max(180).optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
  })
  .strict();
const watchlistRequestSchema = z.object({ active: z.boolean() }).strict();
const watchlistRevisionSchema = z.coerce.number().int().positive();
const sportsQuerySchema = z
  .object({ mode: z.enum(['live', 'futures']).default('live'), league: z.string().optional() })
  .strict();
const communityQuerySchema = z
  .object({ period: z.enum(['today', 'week', 'month']).default('week') })
  .strict();

let requestSequence = 0;

function requestId(request: Request) {
  const suffix = new URL(request.url).pathname.replace(/[^a-z0-9]/gi, '-').slice(-24);
  requestSequence += 1;
  return `mock-${suffix || 'request'}-${requestSequence.toString().padStart(4, '0')}`;
}

function apiError(
  request: Request,
  status: number,
  code:
    | 'BAD_REQUEST'
    | 'NOT_FOUND'
    | 'CONFLICT'
    | 'RATE_LIMITED'
    | 'VALIDATION_ERROR'
    | 'INTERNAL_ERROR',
  message: string,
  retryable = false,
  headers?: Record<string, string>,
) {
  return HttpResponse.json(
    { error: { code, message, requestId: requestId(request), retryable } },
    { status, ...(headers ? { headers } : {}) },
  );
}

async function prepare(request: Request, key: string) {
  const requestedScenario = request.headers.get('X-Mock-Scenario');
  const parsed = scenarioSchema.safeParse(requestedScenario ?? 'success');
  if (!parsed.success) {
    return {
      scenario: 'success' as const,
      failure: apiError(request, 400, 'BAD_REQUEST', '未知的模拟场景'),
    };
  }
  const scenario = parsed.data;
  await delay(mockRuntime.latency(key, scenario));
  if (scenario === 'rate-limit') {
    return {
      scenario,
      failure: apiError(request, 429, 'RATE_LIMITED', '请求过于频繁，请稍后重试', true, {
        'Retry-After': '1',
      }),
    };
  }
  if (scenario === 'malformed') {
    return { scenario, failure: HttpResponse.json({ malformed: true }) };
  }
  if (scenario === 'fail-first' && mockRuntime.shouldFailFirst(key)) {
    return {
      scenario,
      failure: apiError(request, 503, 'INTERNAL_ERROR', '首次请求模拟失败，请重试', true),
    };
  }
  return { scenario, failure: null };
}

export const handlers = [
  http.get(`${API_BASE_URL}/v1/markets`, async ({ request }) => {
    const { scenario, failure } = await prepare(request, 'markets:list');
    if (failure) return failure;
    const url = new URL(request.url);
    const parsed = marketQuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) return apiError(request, 400, 'BAD_REQUEST', '盘口筛选参数无效');
    try {
      return HttpResponse.json(mockRuntime.listMarkets(parsed.data, scenario));
    } catch (error) {
      if (error instanceof Error && error.message === 'INVALID_CURSOR') {
        return apiError(request, 400, 'BAD_REQUEST', '分页游标无效');
      }
      return apiError(request, 500, 'INTERNAL_ERROR', '模拟服务暂时不可用', true);
    }
  }),
  http.get(`${API_BASE_URL}/v1/markets/:slug`, async ({ request, params }) => {
    const { scenario, failure } = await prepare(request, `markets:${String(params.slug)}`);
    if (failure) return failure;
    try {
      const response = mockRuntime.getMarket(String(params.slug), scenario);
      if (!response) return apiError(request, 404, 'NOT_FOUND', '没有找到这个盘口');
      return HttpResponse.json(response);
    } catch {
      return apiError(request, 500, 'INTERNAL_ERROR', '模拟服务暂时不可用', true);
    }
  }),
  http.get(`${API_BASE_URL}/v1/watchlist`, async ({ request }) => {
    const { scenario, failure } = await prepare(request, 'watchlist:list');
    if (failure) return failure;
    try {
      return HttpResponse.json(mockRuntime.getWatchlist(scenario));
    } catch {
      return apiError(request, 500, 'INTERNAL_ERROR', '关注列表暂时不可用', true);
    }
  }),
  http.patch(`${API_BASE_URL}/v1/watchlist/:marketId`, async ({ request, params }) => {
    const { scenario, failure } = await prepare(request, `watchlist:${String(params.marketId)}`);
    if (failure) return failure;
    const body = watchlistRequestSchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return apiError(request, 400, 'VALIDATION_ERROR', '收藏状态无效');
    const revision = watchlistRevisionSchema.safeParse(request.headers.get('If-Match'));
    if (!revision.success) return apiError(request, 400, 'BAD_REQUEST', '缺少有效的关注列表版本');
    try {
      const response = mockRuntime.setWatchlist(
        String(params.marketId),
        body.data.active,
        revision.data,
        scenario,
      );
      if (!response) return apiError(request, 404, 'NOT_FOUND', '没有找到这个盘口');
      return HttpResponse.json(response);
    } catch (error) {
      if (error instanceof Error && error.message === 'REVISION_CONFLICT') {
        return apiError(request, 409, 'CONFLICT', '关注列表已更新，请刷新后重试');
      }
      return apiError(request, 500, 'INTERNAL_ERROR', '关注列表暂时不可用', true);
    }
  }),
  http.post(`${API_BASE_URL}/v1/previews/trades`, async ({ request }) => {
    const { scenario, failure } = await prepare(request, 'previews:trades');
    if (failure) return failure;
    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (!idempotencyKey) return apiError(request, 400, 'BAD_REQUEST', '缺少幂等键');
    const body: unknown = await request.json().catch(() => null);
    try {
      return HttpResponse.json(mockRuntime.createTradePreview(body, idempotencyKey, scenario), {
        status: 201,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'IDEMPOTENCY_CONFLICT') {
        return apiError(request, 409, 'CONFLICT', '幂等键已用于不同的预览请求');
      }
      if (error instanceof Error && error.message === 'MARKET_OR_OUTCOME_NOT_FOUND') {
        return apiError(request, 404, 'NOT_FOUND', '盘口或结果不存在');
      }
      if (error instanceof Error && error.message === 'INSUFFICIENT_DEMO_POSITION') {
        return apiError(request, 409, 'CONFLICT', '演示持仓不足，最多可卖出 250 份');
      }
      return apiError(request, 400, 'VALIDATION_ERROR', '预览参数无效');
    }
  }),
  http.post(`${API_BASE_URL}/v1/previews/:kind`, async ({ request, params }) => {
    const { scenario, failure } = await prepare(request, `previews:${String(params.kind)}`);
    if (failure) return failure;
    const routeKind = z.enum(['sports', 'combos', 'perps']).safeParse(params.kind);
    if (!routeKind.success) return apiError(request, 404, 'NOT_FOUND', '预览类型不存在');
    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (!idempotencyKey) return apiError(request, 400, 'BAD_REQUEST', '缺少幂等键');
    const body: unknown = await request.json().catch(() => null);
    const bodyKind = body && typeof body === 'object' && 'kind' in body ? body.kind : null;
    const expectedKind = routeKind.data === 'combos' ? 'combo' : routeKind.data;
    if (bodyKind !== expectedKind) return apiError(request, 400, 'BAD_REQUEST', '预览类型不匹配');
    try {
      return HttpResponse.json(mockRuntime.createProductPreview(body, idempotencyKey, scenario), {
        status: 201,
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'IDEMPOTENCY_CONFLICT') {
        return apiError(request, 409, 'CONFLICT', '幂等键已用于不同预览请求');
      }
      if (error instanceof Error && error.message === 'SELECTION_NOT_FOUND') {
        return apiError(request, 404, 'NOT_FOUND', '预览项目不存在');
      }
      return apiError(request, 400, 'VALIDATION_ERROR', '预览参数无效');
    }
  }),
  http.get(`${API_BASE_URL}/v1/sports/events`, async ({ request }) => {
    const { scenario, failure } = await prepare(request, 'sports:events');
    if (failure) return failure;
    const parsed = sportsQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!parsed.success) return apiError(request, 400, 'BAD_REQUEST', '体育筛选参数无效');
    try {
      return HttpResponse.json(
        mockRuntime.listSports(parsed.data.mode, parsed.data.league, scenario),
      );
    } catch {
      return apiError(request, 500, 'INTERNAL_ERROR', '体育模拟服务暂时不可用', true);
    }
  }),
  http.get(`${API_BASE_URL}/v1/combos/legs`, async ({ request }) => {
    const { scenario, failure } = await prepare(request, 'combos:legs');
    if (failure) return failure;
    try {
      return HttpResponse.json(mockRuntime.listComboLegs(scenario));
    } catch {
      return apiError(request, 500, 'INTERNAL_ERROR', '组合模拟服务暂时不可用', true);
    }
  }),
  http.get(`${API_BASE_URL}/v1/perps/assets`, async ({ request }) => {
    const { scenario, failure } = await prepare(request, 'perps:assets');
    if (failure) return failure;
    try {
      return HttpResponse.json(mockRuntime.listPerps(scenario));
    } catch {
      return apiError(request, 500, 'INTERNAL_ERROR', '永续资产服务暂时不可用', true);
    }
  }),
  http.get(`${API_BASE_URL}/v1/perps/assets/:symbol`, async ({ request, params }) => {
    const { scenario, failure } = await prepare(request, `perps:${String(params.symbol)}`);
    if (failure) return failure;
    const range = new URL(request.url).searchParams.get('range') ?? '1d';
    if (!['1h', '4h', '1d', '1w', '1m'].includes(range)) {
      return apiError(request, 400, 'BAD_REQUEST', '价格区间无效');
    }
    let response;
    try {
      response = mockRuntime.getPerps(String(params.symbol), range, scenario);
    } catch {
      return apiError(request, 500, 'INTERNAL_ERROR', '永续资产服务暂时不可用', true);
    }
    if (!response) return apiError(request, 404, 'NOT_FOUND', '没有找到这个永续资产');
    return HttpResponse.json(response);
  }),
  http.get(`${API_BASE_URL}/v1/community/:view`, async ({ request, params }) => {
    const { scenario, failure } = await prepare(request, `community:${String(params.view)}`);
    if (failure) return failure;
    const view = z.enum(['leaderboard', 'activity', 'accuracy']).safeParse(params.view);
    const query = communityQuerySchema.safeParse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!view.success || !query.success) {
      return apiError(request, 400, 'BAD_REQUEST', '社区视图参数无效');
    }
    try {
      return HttpResponse.json(mockRuntime.getCommunity(view.data, query.data.period, scenario));
    } catch {
      return apiError(request, 500, 'INTERNAL_ERROR', '社区服务暂时不可用', true);
    }
  }),
  http.get(`${API_BASE_URL}/v1/account`, async ({ request }) => {
    const { scenario, failure } = await prepare(request, 'account:detail');
    if (failure) return failure;
    try {
      return HttpResponse.json(mockRuntime.getAccount(scenario));
    } catch {
      return apiError(request, 500, 'INTERNAL_ERROR', '演示账户暂时不可用', true);
    }
  }),
  http.get(`${API_BASE_URL}/v1/markets/:marketId/order-book`, async ({ request, params }) => {
    const { scenario, failure } = await prepare(request, `order-book:${String(params.marketId)}`);
    if (failure) return failure;
    const outcomeId = new URL(request.url).searchParams.get('outcomeId');
    if (!outcomeId) return apiError(request, 400, 'BAD_REQUEST', '缺少结果标识');
    let response;
    try {
      response = mockRuntime.getOrderBook(String(params.marketId), outcomeId, scenario);
    } catch {
      return apiError(request, 500, 'INTERNAL_ERROR', '盘口深度暂时不可用', true);
    }
    if (!response) return apiError(request, 404, 'NOT_FOUND', '盘口或结果不存在');
    return HttpResponse.json(response);
  }),
  http.get(`${API_BASE_URL}/v1/markets/:marketId/comments`, async ({ request, params }) => {
    const { scenario, failure } = await prepare(request, `comments:${String(params.marketId)}`);
    if (failure) return failure;
    try {
      const response = mockRuntime.getComments(String(params.marketId), scenario);
      if (!response) return apiError(request, 404, 'NOT_FOUND', '盘口不存在');
      return HttpResponse.json(response);
    } catch {
      return apiError(request, 500, 'INTERNAL_ERROR', '评论服务暂时不可用', true);
    }
  }),
  http.post(`${API_BASE_URL}/v1/markets/:marketId/comments`, async ({ request, params }) => {
    const { scenario, failure } = await prepare(
      request,
      `comments:create:${String(params.marketId)}`,
    );
    if (failure) return failure;
    const idempotencyKey = request.headers.get('Idempotency-Key');
    if (!idempotencyKey) return apiError(request, 400, 'BAD_REQUEST', '缺少幂等键');
    const body = await request.json().catch(() => null);
    try {
      const response = mockRuntime.createComment(
        String(params.marketId),
        body,
        idempotencyKey,
        scenario,
      );
      if (!response) return apiError(request, 404, 'NOT_FOUND', '盘口不存在');
      return HttpResponse.json(response, { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.message === 'IDEMPOTENCY_CONFLICT') {
        return apiError(request, 409, 'CONFLICT', '幂等键已用于不同评论');
      }
      return apiError(request, 400, 'VALIDATION_ERROR', '评论内容无效');
    }
  }),
];
