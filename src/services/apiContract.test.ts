import { beforeEach } from 'vitest';
import { mockRuntime } from '@/mock-backend/runtime';
import { marketListResponseSchema } from '@/types/market';
import { watchlistMutationResponseSchema, watchlistResponseSchema } from '@/types/api';
import { tradePreviewResponseSchema } from '@/types/api';
import { combosResponseSchema, perpsListResponseSchema } from '@/types/product';
import { commentsResponseSchema, orderBookResponseSchema } from '@/types/marketExtras';
import { accountResponseSchema } from '@/types/account';
import { ApiError, apiRequest } from './apiClient';

describe('mock HTTP contract', () => {
  beforeEach(() => mockRuntime.reset());

  it('isolates concurrent request scenarios', async () => {
    const [success, failure] = await Promise.allSettled([
      apiRequest('/v1/markets', {
        schema: marketListResponseSchema,
        headers: { 'X-Mock-Scenario': 'success' },
      }),
      apiRequest('/v1/markets', {
        schema: marketListResponseSchema,
        headers: { 'X-Mock-Scenario': 'server-error' },
      }),
    ]);
    expect(success.status).toBe('fulfilled');
    expect(failure.status).toBe('rejected');
    if (failure.status === 'rejected') expect(failure.reason).toBeInstanceOf(ApiError);
  });

  it('exposes stale, rate-limit, malformed and invalid-cursor contracts', async () => {
    const stale = await apiRequest('/v1/markets', {
      schema: marketListResponseSchema,
      headers: { 'X-Mock-Scenario': 'stale' },
    });
    expect(stale.meta.stale).toBe(true);

    await expect(
      apiRequest('/v1/markets', {
        schema: marketListResponseSchema,
        headers: { 'X-Mock-Scenario': 'rate-limit' },
      }),
    ).rejects.toMatchObject({ status: 429, code: 'RATE_LIMITED' });
    await expect(
      apiRequest('/v1/markets', {
        schema: marketListResponseSchema,
        headers: { 'X-Mock-Scenario': 'malformed' },
      }),
    ).rejects.toMatchObject({ status: 200, code: 'INVALID_RESPONSE', retryable: false });
    await expect(
      apiRequest('/v1/markets?cursor=bad', { schema: marketListResponseSchema }),
    ).rejects.toMatchObject({ status: 400, code: 'BAD_REQUEST' });
  });

  it('fails only the first request for a fail-first scenario', async () => {
    await expect(
      apiRequest('/v1/markets', {
        schema: marketListResponseSchema,
        headers: { 'X-Mock-Scenario': 'fail-first' },
      }),
    ).rejects.toMatchObject({ status: 503 });
    const retry = await apiRequest('/v1/markets', {
      schema: marketListResponseSchema,
      headers: { 'X-Mock-Scenario': 'fail-first' },
    });
    expect(retry.data.length).toBeGreaterThan(0);
  });

  it('rejects unknown comment markets and invalid perps ranges', async () => {
    await expect(
      apiRequest('/v1/markets/mkt-missing/comments', { schema: marketListResponseSchema }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
    await expect(
      apiRequest('/v1/perps/assets/btc?range=forever', { schema: marketListResponseSchema }),
    ).rejects.toMatchObject({ status: 400, code: 'BAD_REQUEST' });
  });

  it('enforces watchlist revisions and returns conflicts for stale writes', async () => {
    const initial = await apiRequest('/v1/watchlist', { schema: watchlistResponseSchema });
    const changed = await apiRequest('/v1/watchlist/mkt-weather-record', {
      method: 'PATCH',
      body: { active: true },
      headers: { 'If-Match': String(initial.data.revision) },
      schema: watchlistMutationResponseSchema,
    });
    expect(changed.data.revision).toBe(initial.data.revision + 1);
    await expect(
      apiRequest('/v1/watchlist/mkt-iran-deal', {
        method: 'PATCH',
        body: { active: true },
        headers: { 'If-Match': String(initial.data.revision) },
        schema: watchlistMutationResponseSchema,
      }),
    ).rejects.toMatchObject({ status: 409, code: 'CONFLICT' });
  });

  it('honors abort signals', async () => {
    const controller = new AbortController();
    window.setTimeout(() => controller.abort(), 10);
    await expect(
      apiRequest('/v1/markets', {
        schema: marketListResponseSchema,
        signal: controller.signal,
        headers: { 'X-Mock-Scenario': 'slow' },
      }),
    ).rejects.toMatchObject({ name: 'AbortError' });
  });

  it('rejects invalid scenarios and exposes Retry-After for throttling', async () => {
    await expect(
      apiRequest('/v1/markets', {
        schema: marketListResponseSchema,
        headers: { 'X-Mock-Scenario': 'not-a-scenario' },
      }),
    ).rejects.toMatchObject({ status: 400, code: 'BAD_REQUEST' });
    const response = await fetch('/api/v1/markets', {
      headers: { 'X-Mock-Scenario': 'rate-limit' },
    });
    expect(response.status).toBe(429);
    expect(response.headers.get('Retry-After')).toBe('1');
  });

  it('requires idempotency keys and rejects conflicting request reuse', async () => {
    const body = {
      marketId: 'mkt-btc-150k',
      outcomeId: 'yes',
      side: 'buy' as const,
      amount: 10,
    };
    await expect(
      apiRequest('/v1/previews/trades', {
        method: 'POST',
        body,
        schema: tradePreviewResponseSchema,
      }),
    ).rejects.toMatchObject({ status: 400, code: 'BAD_REQUEST' });
    await apiRequest('/v1/previews/trades', {
      method: 'POST',
      body,
      headers: { 'Idempotency-Key': 'contract-preview-1' },
      schema: tradePreviewResponseSchema,
    });
    await expect(
      apiRequest('/v1/previews/trades', {
        method: 'POST',
        body: { ...body, amount: 20 },
        headers: { 'Idempotency-Key': 'contract-preview-1' },
        schema: tradePreviewResponseSchema,
      }),
    ).rejects.toMatchObject({ status: 409, code: 'CONFLICT' });
  });

  it('keeps freshness and empty semantics consistent across product domains', async () => {
    const staleHeaders = { 'X-Mock-Scenario': 'stale' };
    const [combos, perps, comments, book] = await Promise.all([
      apiRequest('/v1/combos/legs', { schema: combosResponseSchema, headers: staleHeaders }),
      apiRequest('/v1/perps/assets', { schema: perpsListResponseSchema, headers: staleHeaders }),
      apiRequest('/v1/markets/mkt-btc-150k/comments', {
        schema: commentsResponseSchema,
        headers: staleHeaders,
      }),
      apiRequest('/v1/markets/mkt-btc-150k/order-book?outcomeId=yes', {
        schema: orderBookResponseSchema,
        headers: staleHeaders,
      }),
    ]);
    expect([combos.meta.stale, perps.meta.stale, comments.meta.stale, book.data.stale]).toEqual([
      true,
      true,
      true,
      true,
    ]);
    const emptyHeaders = { 'X-Mock-Scenario': 'empty' };
    const [emptyCombos, emptyPerps, emptyComments, emptyBook, emptyWatchlist, emptyAccount] =
      await Promise.all([
        apiRequest('/v1/combos/legs', { schema: combosResponseSchema, headers: emptyHeaders }),
        apiRequest('/v1/perps/assets', { schema: perpsListResponseSchema, headers: emptyHeaders }),
        apiRequest('/v1/markets/mkt-btc-150k/comments', {
          schema: commentsResponseSchema,
          headers: emptyHeaders,
        }),
        apiRequest('/v1/markets/mkt-btc-150k/order-book?outcomeId=yes', {
          schema: orderBookResponseSchema,
          headers: emptyHeaders,
        }),
        apiRequest('/v1/watchlist', { schema: watchlistResponseSchema, headers: emptyHeaders }),
        apiRequest('/v1/account', { schema: accountResponseSchema, headers: emptyHeaders }),
      ]);
    expect(emptyCombos.data).toEqual([]);
    expect(emptyPerps.data).toEqual([]);
    expect(emptyComments.data).toEqual([]);
    expect(emptyBook.data.buys).toEqual([]);
    expect(emptyBook.data.sells).toEqual([]);
    expect(emptyWatchlist.data.marketIds).toEqual([]);
    expect(emptyAccount.data.positions).toEqual([]);
    expect(emptyAccount.data.activity).toEqual([]);
    await expect(
      apiRequest('/v1/markets/2026-world-cup-winner', {
        schema: marketListResponseSchema,
        headers: emptyHeaders,
      }),
    ).rejects.toMatchObject({ status: 404, code: 'NOT_FOUND' });
  });
});
