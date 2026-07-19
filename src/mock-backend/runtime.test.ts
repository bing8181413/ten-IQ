import { MockRuntime } from './runtime';

describe('MockRuntime', () => {
  it('returns byte-for-byte deterministic market data after reset', () => {
    const runtime = new MockRuntime();
    const first = runtime.listMarkets({ sort: 'volume' });
    runtime.advance(7_200_000);
    runtime.reset();
    expect(runtime.listMarkets({ sort: 'volume' })).toEqual(first);
  });

  it('derives controlled changes when the fixed clock advances', () => {
    const runtime = new MockRuntime();
    const before = runtime.listMarkets().data;
    runtime.advance(3_600_000);
    const after = runtime.listMarkets().data;
    expect(after).not.toEqual(before);
    expect(after.map((market) => market.id)).toEqual(before.map((market) => market.id));
    expect(
      after.every(
        (market) =>
          market.outcomes.reduce((total, outcome) => total + outcome.probability, 0) === 100,
      ),
    ).toBe(true);
  });

  it('uses stable cursors for pagination', () => {
    const runtime = new MockRuntime();
    const first = runtime.listMarkets({ limit: 3 });
    const second = runtime.listMarkets({ limit: 3, cursor: first.meta.nextCursor ?? undefined });
    expect(first.meta.hasMore).toBe(true);
    expect(first.data).toHaveLength(3);
    expect(second.data).toHaveLength(3);
    expect(new Set([...first.data, ...second.data].map((market) => market.id)).size).toBe(6);
    expect(() =>
      runtime.listMarkets({
        category: '加密',
        limit: 3,
        cursor: first.meta.nextCursor ?? undefined,
      }),
    ).toThrow('INVALID_CURSOR');
    expect(() =>
      runtime.listMarkets({ limit: 4, cursor: first.meta.nextCursor ?? undefined }),
    ).toThrow('INVALID_CURSOR');
  });

  it('replays identical preview requests and rejects conflicting idempotency use', () => {
    const runtime = new MockRuntime();
    const request = {
      marketId: 'mkt-btc-150k',
      outcomeId: 'yes',
      side: 'buy' as const,
      amount: 100,
    };
    const first = runtime.createTradePreview(request, 'test-preview-1');
    expect(runtime.createTradePreview(request, 'test-preview-1')).toEqual(first);
    expect(() => runtime.createTradePreview({ ...request, amount: 120 }, 'test-preview-1')).toThrow(
      'IDEMPOTENCY_CONFLICT',
    );
  });

  it('exposes empty and error scenarios without a service fallback', () => {
    const runtime = new MockRuntime();
    runtime.setScenario('empty');
    expect(runtime.listMarkets().data).toEqual([]);
    runtime.setScenario('server-error');
    expect(() => runtime.listMarkets()).toThrow('MOCK_SERVER_ERROR');
  });

  it('marks stale responses without contaminating success requests', () => {
    const runtime = new MockRuntime();
    const stale = runtime.listMarkets({}, 'stale');
    const success = runtime.listMarkets({}, 'success');
    expect(stale.meta.stale).toBe(true);
    expect(success.meta.stale).toBe(false);
    expect(Date.parse(stale.meta.updatedAt)).toBeLessThan(Date.parse(success.meta.updatedAt));
  });

  it('serves distinct domain data for filters and ranges', () => {
    const runtime = new MockRuntime();
    expect(runtime.listSports('live').data.every((event) => event.mode === 'live')).toBe(true);
    expect(runtime.listSports('futures').data.every((event) => event.mode === 'futures')).toBe(
      true,
    );
    expect(runtime.getPerps('btc', '1h')?.data.values).not.toEqual(
      runtime.getPerps('btc', '1m')?.data.values,
    );
    expect(runtime.getCommunity('leaderboard', 'today').data).not.toEqual(
      runtime.getCommunity('leaderboard', 'month').data,
    );
  });

  it('derives market-specific books and stores idempotent demo comments', () => {
    const runtime = new MockRuntime();
    const book = runtime.getOrderBook('mkt-btc-150k', 'yes');
    expect(book?.data.buys).toHaveLength(5);
    expect(book?.data.sells).toHaveLength(5);
    const first = runtime.createComment(
      'mkt-btc-150k',
      { text: '只是一条本地演示评论' },
      'comment-key-1',
    );
    expect(
      runtime.createComment('mkt-btc-150k', { text: '只是一条本地演示评论' }, 'comment-key-1'),
    ).toEqual(first);
    expect(runtime.getComments('mkt-btc-150k')?.data[0]?.text).toBe('只是一条本地演示评论');
  });

  it('calculates sports, combo and perps previews on the mock server', () => {
    const runtime = new MockRuntime();
    const sports = runtime.createProductPreview(
      { kind: 'sports', selection: 'spain-argentina:ESP 60¢', amount: 10 },
      'sports-1',
    );
    const combo = runtime.createProductPreview(
      { kind: 'combo', legIds: ['esp', 'atl'], amount: 10 },
      'combo-1',
    );
    const perps = runtime.createProductPreview(
      { kind: 'perps', symbol: 'btc', side: 'long', amount: 100 },
      'perps-1',
    );
    expect(sports.data.kind).toBe('sports');
    expect(combo.data.estimatedReturn).toBeGreaterThan(10);
    expect(perps.data.summary).toContain('BTC-USD');
  });

  it('covers market filter, sort, alias and invalid cursor branches', () => {
    const runtime = new MockRuntime();
    expect(runtime.listMarkets({ category: '热门' }).data.every((market) => market.trending)).toBe(
      true,
    );
    expect(runtime.listMarkets({ category: '加密', search: 'bitcoin' }).data[0]?.id).toBe(
      'mkt-btc-150k',
    );
    expect(
      runtime.listMarkets({ status: 'live' }).data.every((market) => market.status === 'live'),
    ).toBe(true);
    expect(runtime.listMarkets({ sort: 'newest' }).data[0]?.id).toBe('mkt-ev-share');
    expect(runtime.listMarkets({ sort: 'volume' }).data[0]?.id).toBe('mkt-world-cup-2026');
    expect(() => runtime.listMarkets({ cursor: '-1' })).toThrow('INVALID_CURSOR');
    expect(runtime.getMarket('world-cup-winner')?.data.id).toBe('mkt-world-cup-2026');
    expect(runtime.getMarket('missing-market')).toBeNull();
    runtime.setScenario('server-error');
    expect(() => runtime.getMarket('world-cup-winner')).toThrow('MOCK_SERVER_ERROR');
  });

  it('covers scenario latency and mutable watchlist branches', () => {
    const runtime = new MockRuntime();
    const normal = runtime.latency('same-key');
    runtime.setScenario('slow');
    expect(runtime.latency('same-key')).toBe(normal + 1200);
    expect(runtime.setWatchlist('missing', true, 1)).toBeNull();
    expect(runtime.setWatchlist('mkt-btc-150k', true, 1)?.data.active).toBe(true);
    expect(runtime.getWatchlist().data.marketIds).toContain('mkt-btc-150k');
    expect(runtime.setWatchlist('mkt-btc-150k', false, 2)?.data.active).toBe(false);
    expect(runtime.getWatchlist().data.marketIds).not.toContain('mkt-btc-150k');
    expect(() => runtime.advance(-1)).toThrow('Invalid time advance');
    expect(() => runtime.setWatchlist('mkt-btc-150k', true, 2)).toThrow('REVISION_CONFLICT');
  });

  it('rejects invalid preview and comment branches', () => {
    const runtime = new MockRuntime();
    expect(() =>
      runtime.createTradePreview(
        { marketId: 'mkt-btc-150k', outcomeId: 'yes', side: 'sell', amount: 251 },
        'sell-too-much',
      ),
    ).toThrow('INSUFFICIENT_DEMO_POSITION');
    expect(() =>
      runtime.createTradePreview(
        { marketId: 'mkt-btc-150k', outcomeId: 'missing', side: 'buy', amount: 10 },
        'missing-outcome',
      ),
    ).toThrow('MARKET_OR_OUTCOME_NOT_FOUND');
    expect(() =>
      runtime.createProductPreview(
        { kind: 'combo', legIds: ['esp', 'esp'], amount: 10 },
        'duplicate-legs',
      ),
    ).toThrow('DUPLICATE_LEGS');
    expect(() =>
      runtime.createProductPreview(
        { kind: 'perps', symbol: 'missing', side: 'long', amount: 10 },
        'missing-asset',
      ),
    ).toThrow('SELECTION_NOT_FOUND');
    expect(runtime.createComment('missing', { text: 'test' }, 'missing-comment')).toBeNull();
    runtime.createComment('mkt-btc-150k', { text: 'one' }, 'conflict-comment');
    expect(() =>
      runtime.createComment('mkt-btc-150k', { text: 'two' }, 'conflict-comment'),
    ).toThrow('IDEMPOTENCY_CONFLICT');
  });

  it('returns empty product data and handles unknown perps ranges', () => {
    const runtime = new MockRuntime();
    expect(runtime.getPerps('missing', '1d')).toBeNull();
    expect(runtime.getPerps('btc', 'unknown')?.data.values).toEqual(
      runtime.getPerps('btc', '1d')?.data.values,
    );
    runtime.setScenario('empty');
    expect(runtime.listSports('live').data).toEqual([]);
    expect(runtime.listComboLegs().data).toEqual([]);
    expect(runtime.listPerps().data).toEqual([]);
    expect(runtime.getPerps('btc', '1d')).toBeNull();
    expect(runtime.getCommunity('accuracy', 'week').data).toEqual({ score: 0, buckets: [] });
    expect(runtime.getCommunity('activity', 'week').data).toEqual([]);
  });
});
