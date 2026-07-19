import {
  accountConfig,
  configuredMarkets,
  marketExtrasConfig,
  mockManifest,
  productConfig,
  type MockScenario,
} from './config';
import { accountResponseSchema } from '@/types/account';
import {
  commentRequestSchema,
  commentResponseSchema,
  commentsResponseSchema,
  orderBookResponseSchema,
} from '@/types/marketExtras';
import {
  productPreviewRequestSchema,
  productPreviewResponseSchema,
  tradePreviewRequestSchema,
  tradePreviewResponseSchema,
} from '@/types/api';
import { marketListResponseSchema, marketResponseSchema, type Market } from '@/types/market';
import {
  combosResponseSchema,
  communityResponseSchema,
  perpsListResponseSchema,
  perpsResponseSchema,
  sportsResponseSchema,
  type CommunityPeriod,
} from '@/types/product';

export interface RuntimeMarketFilters {
  category?: string | undefined;
  status?: Market['status'] | undefined;
  sort?: 'trending' | 'volume' | 'newest' | undefined;
  search?: string | undefined;
  topic?: string | undefined;
  cursor?: string | undefined;
  limit?: number | undefined;
}

const slugAliases: Record<string, string> = {
  'world-cup-winner': '2026-world-cup-winner',
};

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export class MockRuntime {
  private nowMs = Date.parse(mockManifest.fixedNow);
  private scenario: MockScenario = mockManifest.defaultScenario;
  private readonly watchlist = new Set<string>(accountConfig.watchlistMarketIds);
  private watchlistRevision = 1;
  private readonly failFirst = new Set<string>();
  private readonly idempotency = new Map<string, { body: string; response: unknown }>();
  private comments = marketExtrasConfig.comments.map((comment) => ({ ...comment }));

  now() {
    return new Date(this.nowMs).toISOString();
  }

  advance(milliseconds: number) {
    if (!Number.isFinite(milliseconds) || milliseconds < 0) throw new Error('Invalid time advance');
    this.nowMs += milliseconds;
  }

  setScenario(scenario: MockScenario) {
    this.scenario = scenario;
  }

  getScenario() {
    return this.scenario;
  }

  reset() {
    this.nowMs = Date.parse(mockManifest.fixedNow);
    this.scenario = mockManifest.defaultScenario;
    this.watchlist.clear();
    accountConfig.watchlistMarketIds.forEach((marketId) => this.watchlist.add(marketId));
    this.watchlistRevision = 1;
    this.failFirst.clear();
    this.idempotency.clear();
    this.comments = marketExtrasConfig.comments.map((comment) => ({ ...comment }));
  }

  latency(key: string, scenario: MockScenario = this.scenario) {
    const random = mulberry32(mockManifest.seed + hash(`${key}:${this.nowMs}`));
    const base = Math.round(
      mockManifest.latencyMs.min +
        random() * (mockManifest.latencyMs.max - mockManifest.latencyMs.min),
    );
    return scenario === 'slow' ? base + 1200 : base;
  }

  shouldFailFirst(key: string) {
    if (this.failFirst.has(key)) return false;
    this.failFirst.add(key);
    return true;
  }

  private responseNow(scenario: MockScenario) {
    return new Date(this.nowMs - (scenario === 'stale' ? 86_400_000 : 0)).toISOString();
  }

  private assertAvailable(scenario: MockScenario) {
    if (scenario === 'server-error') throw new Error('MOCK_SERVER_ERROR');
  }

  private deriveMarket(market: Market): Market {
    const timeBucket = Math.floor(this.nowMs / 3_600_000);
    const random = mulberry32(mockManifest.seed + hash(`${market.id}:${timeBucket}`));
    const volumeDelta = Math.floor(random() * 3500);
    return {
      ...market,
      volume: market.volume + volumeDelta,
      traders: market.traders + Math.floor(volumeDelta / 180),
      outcomes: (() => {
        const values = market.outcomes.map((outcome) => outcome.probability);
        const first = Math.max(
          1,
          Math.min(99, (values[0] ?? 50) + Math.round((random() - 0.5) * 2)),
        );
        const restOriginal = values.slice(1);
        const restTotal = restOriginal.reduce((total, value) => total + value, 0);
        const remaining = 100 - first;
        const normalized = [
          first,
          ...restOriginal.map((value) =>
            restTotal > 0 ? Math.round((value / restTotal) * remaining) : 0,
          ),
        ];
        const correction = 100 - normalized.reduce((total, value) => total + value, 0);
        normalized[normalized.length - 1] = (normalized.at(-1) ?? 0) + correction;
        return market.outcomes.map((outcome, index) => ({
          ...outcome,
          probability: normalized[index] ?? outcome.probability,
        }));
      })(),
    };
  }

  listMarkets(filters: RuntimeMarketFilters = {}, scenario: MockScenario = this.scenario) {
    this.assertAvailable(scenario);
    let data =
      scenario === 'empty' ? [] : configuredMarkets.map((market) => this.deriveMarket(market));
    const search = filters.search?.trim().toLocaleLowerCase(mockManifest.locale);
    const topic = filters.topic?.trim().toLocaleLowerCase(mockManifest.locale);
    data = data.filter((market) => {
      const matchesCategory =
        !filters.category ||
        filters.category === '全部' ||
        (filters.category === '热门' ? market.trending : market.category === filters.category);
      const matchesStatus = !filters.status || market.status === filters.status;
      const matchesSearch =
        !search ||
        market.title.toLocaleLowerCase(mockManifest.locale).includes(search) ||
        market.tags.some((tag) => tag.toLocaleLowerCase(mockManifest.locale).includes(search));
      const matchesTopic =
        !topic ||
        market.category.toLocaleLowerCase(mockManifest.locale).includes(topic) ||
        market.title.toLocaleLowerCase(mockManifest.locale).includes(topic) ||
        market.tags.some((tag) => tag.toLocaleLowerCase(mockManifest.locale).includes(topic));
      return matchesCategory && matchesStatus && matchesSearch && matchesTopic;
    });
    data.sort((a, b) =>
      filters.sort === 'volume'
        ? b.volume - a.volume
        : filters.sort === 'newest'
          ? b.endDate.localeCompare(a.endDate)
          : Number(b.trending) - Number(a.trending) || b.volume - a.volume,
    );
    const total = data.length;
    const limit = Math.min(filters.limit ?? mockManifest.pageSize, 50);
    const fingerprint = hash(
      JSON.stringify({
        category: filters.category ?? '',
        status: filters.status ?? '',
        sort: filters.sort ?? 'trending',
        search: filters.search?.trim() ?? '',
        topic: filters.topic?.trim() ?? '',
        limit,
      }),
    ).toString(16);
    let start = 0;
    if (filters.cursor) {
      const [datasetVersion, cursorFingerprint, lastId, extra] = filters.cursor.split('|');
      if (
        extra ||
        datasetVersion !== mockManifest.datasetVersion ||
        cursorFingerprint !== fingerprint
      ) {
        throw new Error('INVALID_CURSOR');
      }
      const index = data.findIndex((market) => market.id === lastId);
      if (index < 0) throw new Error('INVALID_CURSOR');
      start = index + 1;
    }
    const page = data.slice(start, start + limit);
    const next = start + page.length;
    return marketListResponseSchema.parse({
      data: page,
      meta: {
        total,
        updatedAt: this.responseNow(scenario),
        stale: scenario === 'stale',
        nextCursor:
          next < total && page.length
            ? `${mockManifest.datasetVersion}|${fingerprint}|${page.at(-1)?.id ?? ''}`
            : null,
        hasMore: next < total,
      },
    });
  }

  getMarket(slug: string, scenario: MockScenario = this.scenario) {
    this.assertAvailable(scenario);
    if (scenario === 'empty') return null;
    const normalizedSlug = slugAliases[slug] ?? slug;
    const market = configuredMarkets.find((item) => item.slug === normalizedSlug);
    if (!market) return null;
    return marketResponseSchema.parse({
      data: this.deriveMarket(market),
      meta: { updatedAt: this.responseNow(scenario), stale: scenario === 'stale' },
    });
  }

  listSports(mode: 'live' | 'futures', league?: string, scenario: MockScenario = this.scenario) {
    this.assertAvailable(scenario);
    const data =
      scenario === 'empty'
        ? []
        : productConfig.sports.events.filter(
            (event) =>
              event.mode === mode && (!league || league === '全部' || event.league === league),
          );
    return sportsResponseSchema.parse({
      data,
      meta: {
        leagues: productConfig.sports.leagues,
        updatedAt: this.responseNow(scenario),
        stale: scenario === 'stale',
      },
    });
  }

  listComboLegs(scenario: MockScenario = this.scenario) {
    this.assertAvailable(scenario);
    return combosResponseSchema.parse({
      data: scenario === 'empty' ? [] : productConfig.combos,
      meta: { updatedAt: this.responseNow(scenario), stale: scenario === 'stale' },
    });
  }

  listPerps(scenario: MockScenario = this.scenario) {
    this.assertAvailable(scenario);
    return perpsListResponseSchema.parse({
      data: scenario === 'empty' ? [] : productConfig.perps,
      meta: { updatedAt: this.responseNow(scenario), stale: scenario === 'stale' },
    });
  }

  getPerps(symbol: string, range: string, scenario: MockScenario = this.scenario) {
    this.assertAvailable(scenario);
    const asset = productConfig.perps.find((item) => item.symbol === symbol);
    if (!asset || scenario === 'empty') return null;
    const scaleByRange: Record<string, number> = {
      '1h': 0.2,
      '4h': 0.45,
      '1d': 1,
      '1w': 1.65,
      '1m': 2.4,
    };
    const scale = scaleByRange[range] ?? 1;
    const anchor = asset.values.at(-1) ?? asset.price;
    return perpsResponseSchema.parse({
      data: {
        ...asset,
        values: asset.values.map((value) => Number((anchor + (value - anchor) * scale).toFixed(2))),
      },
      meta: { updatedAt: this.responseNow(scenario), stale: scenario === 'stale' },
    });
  }

  getCommunity(
    view: 'leaderboard' | 'activity' | 'accuracy',
    period: CommunityPeriod,
    scenario: MockScenario = this.scenario,
  ) {
    this.assertAvailable(scenario);
    const source = productConfig.community[view][period];
    return communityResponseSchema.parse({
      data: scenario === 'empty' ? (view === 'accuracy' ? { score: 0, buckets: [] } : []) : source,
      meta: { view, period, updatedAt: this.responseNow(scenario), stale: scenario === 'stale' },
    });
  }

  getAccount(scenario: MockScenario = this.scenario) {
    this.assertAvailable(scenario);
    return accountResponseSchema.parse({
      data:
        scenario === 'empty'
          ? {
              ...accountConfig,
              watchlistMarketIds: [],
              positions: [],
              activity: [],
              openPositions: 0,
            }
          : { ...accountConfig, watchlistMarketIds: [...this.watchlist] },
      meta: {
        mode: 'demo',
        updatedAt: this.responseNow(scenario),
        stale: scenario === 'stale',
      },
    });
  }

  getOrderBook(marketId: string, outcomeId: string, scenario: MockScenario = this.scenario) {
    this.assertAvailable(scenario);
    const baseMarket = configuredMarkets.find((item) => item.id === marketId);
    const market = baseMarket ? this.deriveMarket(baseMarket) : undefined;
    const outcome = market?.outcomes.find((item) => item.id === outcomeId);
    if (!market || !outcome) return null;
    const random = mulberry32(mockManifest.seed + hash(`${marketId}:${outcomeId}:book`));
    const midpoint = Math.max(3, Math.min(97, Math.round(outcome.probability)));
    const createLevels = (side: 'buy' | 'sell') =>
      Array.from({ length: 5 }, (_, index) => ({
        price:
          side === 'buy' ? Math.max(1, midpoint - index - 1) : Math.min(99, midpoint + index + 1),
        shares: 500 + Math.floor(random() * 2500),
      }));
    return orderBookResponseSchema.parse({
      data: {
        marketId,
        outcomeId,
        buys: scenario === 'empty' ? [] : createLevels('buy'),
        sells: scenario === 'empty' ? [] : createLevels('sell'),
        updatedAt: this.responseNow(scenario),
        stale: scenario === 'stale',
        mode: 'demo',
      },
    });
  }

  getComments(marketId: string, scenario: MockScenario = this.scenario) {
    this.assertAvailable(scenario);
    if (!configuredMarkets.some((market) => market.id === marketId)) return null;
    const data =
      scenario === 'empty' ? [] : this.comments.filter((comment) => comment.marketId === marketId);
    return commentsResponseSchema.parse({
      data,
      meta: {
        total: data.length,
        updatedAt: this.responseNow(scenario),
        stale: scenario === 'stale',
      },
    });
  }

  createComment(
    marketId: string,
    input: unknown,
    idempotencyKey: string,
    scenario: MockScenario = this.scenario,
  ) {
    this.assertAvailable(scenario);
    if (!configuredMarkets.some((market) => market.id === marketId)) return null;
    const request = commentRequestSchema.parse(input);
    const serialized = JSON.stringify(request);
    const cacheKey = `comment:${idempotencyKey}`;
    const existing = this.idempotency.get(cacheKey);
    if (existing && existing.body !== serialized) throw new Error('IDEMPOTENCY_CONFLICT');
    if (existing) return commentResponseSchema.parse(existing.response);
    const response = commentResponseSchema.parse({
      data: {
        id: `comment-${hash(`${marketId}:${idempotencyKey}`).toString(16)}`,
        marketId,
        author: '本地演示用户',
        text: request.text,
        createdAt: this.responseNow(scenario),
        mode: 'demo',
      },
    });
    const { mode: _mode, ...comment } = response.data;
    void _mode;
    this.comments.unshift(comment);
    this.idempotency.set(cacheKey, { body: serialized, response });
    return response;
  }

  setWatchlist(
    marketId: string,
    active: boolean,
    expectedRevision: number,
    scenario: MockScenario = this.scenario,
  ) {
    this.assertAvailable(scenario);
    if (!configuredMarkets.some((market) => market.id === marketId)) return null;
    if (expectedRevision !== this.watchlistRevision) throw new Error('REVISION_CONFLICT');
    if (active) this.watchlist.add(marketId);
    else this.watchlist.delete(marketId);
    this.watchlistRevision += 1;
    return {
      data: {
        marketId,
        active,
        revision: this.watchlistRevision,
        mode: 'demo' as const,
        updatedAt: this.responseNow(scenario),
      },
    };
  }

  getWatchlist(scenario: MockScenario = this.scenario) {
    this.assertAvailable(scenario);
    return {
      data: {
        marketIds: scenario === 'empty' ? [] : [...this.watchlist],
        revision: this.watchlistRevision,
        mode: 'demo' as const,
        updatedAt: this.responseNow(scenario),
      },
    };
  }

  createTradePreview(
    input: unknown,
    idempotencyKey: string,
    scenario: MockScenario = this.scenario,
  ) {
    this.assertAvailable(scenario);
    const request = tradePreviewRequestSchema.parse(input);
    const serialized = JSON.stringify(request);
    const existing = this.idempotency.get(idempotencyKey);
    if (existing && existing.body !== serialized) throw new Error('IDEMPOTENCY_CONFLICT');
    if (existing) return tradePreviewResponseSchema.parse(existing.response);
    const market = configuredMarkets.find((item) => item.id === request.marketId);
    const outcome = market?.outcomes.find((item) => item.id === request.outcomeId);
    if (!market || !outcome) throw new Error('MARKET_OR_OUTCOME_NOT_FOUND');
    if (request.side === 'sell' && request.amount > 250) {
      throw new Error('INSUFFICIENT_DEMO_POSITION');
    }
    const averagePrice = Math.max(1, Math.min(99, outcome.probability));
    const estimatedShares =
      request.side === 'buy'
        ? Number((request.amount / (averagePrice / 100)).toFixed(2))
        : request.amount;
    const maxPayout =
      request.side === 'buy'
        ? Number(estimatedShares.toFixed(2))
        : Number((estimatedShares * (averagePrice / 100)).toFixed(2));
    const response = tradePreviewResponseSchema.parse({
      data: {
        id: `preview-${hash(`${idempotencyKey}:${serialized}`).toString(16)}`,
        mode: 'demo',
        marketId: request.marketId,
        outcomeId: request.outcomeId,
        side: request.side,
        amount: request.amount,
        averagePrice,
        estimatedShares,
        maxPayout,
        priceImpact: Number(
          Math.min(4.99, (request.amount / Math.max(market.liquidity, 1)) * 100).toFixed(2),
        ),
        createdAt: this.responseNow(scenario),
        expiresAt: new Date(this.nowMs + 30_000).toISOString(),
      },
    });
    this.idempotency.set(idempotencyKey, { body: serialized, response });
    return response;
  }

  createProductPreview(
    input: unknown,
    idempotencyKey: string,
    scenario: MockScenario = this.scenario,
  ) {
    this.assertAvailable(scenario);
    const request = productPreviewRequestSchema.parse(input);
    const serialized = JSON.stringify(request);
    const cacheKey = `product-preview:${idempotencyKey}`;
    const existing = this.idempotency.get(cacheKey);
    if (existing && existing.body !== serialized) throw new Error('IDEMPOTENCY_CONFLICT');
    if (existing) return productPreviewResponseSchema.parse(existing.response);

    let summary = '';
    let estimatedReturn = 0;
    if (request.kind === 'sports') {
      const eventId = request.selection.split(':')[0] ?? '';
      const event = productConfig.sports.events.find((item) => item.id === eventId);
      const selectionLabel = request.selection.slice(eventId.length + 1);
      const allowedSelections = event
        ? [
            `${event.home.short} ${event.home.price}¢`,
            `${event.away.short} ${event.away.price}¢`,
            ...event.spread,
            ...event.total,
          ]
        : [];
      if (!event || !allowedSelections.includes(selectionLabel)) {
        throw new Error('SELECTION_NOT_FOUND');
      }
      summary = `体育选择：${request.selection}`;
      estimatedReturn = Number((request.amount * 1.82).toFixed(2));
    } else if (request.kind === 'combo') {
      if (new Set(request.legIds).size !== request.legIds.length) throw new Error('DUPLICATE_LEGS');
      const legs = request.legIds.map((id) => productConfig.combos.find((leg) => leg.id === id));
      if (legs.some((leg) => !leg)) throw new Error('SELECTION_NOT_FOUND');
      const probability = legs.reduce((value, leg) => value * ((leg?.probability ?? 0) / 100), 1);
      summary = `组合 ${request.legIds.length} 项（独立概率演示估算）`;
      estimatedReturn = Number((request.amount / Math.max(probability, 0.01)).toFixed(2));
    } else {
      const asset = productConfig.perps.find((item) => item.symbol === request.symbol);
      if (!asset) throw new Error('SELECTION_NOT_FOUND');
      summary = `${asset.name} ${request.side === 'long' ? '做多' : '做空'}意图`;
      estimatedReturn = Number((request.amount * 1.01).toFixed(2));
    }
    const response = productPreviewResponseSchema.parse({
      data: {
        id: `preview-${hash(`${cacheKey}:${serialized}`).toString(16)}`,
        kind: request.kind,
        summary,
        estimatedReturn,
        mode: 'demo',
        createdAt: this.responseNow(scenario),
        expiresAt: new Date(this.nowMs + 30_000).toISOString(),
      },
    });
    this.idempotency.set(cacheKey, { body: serialized, response });
    return response;
  }
}

export const mockRuntime = new MockRuntime();
