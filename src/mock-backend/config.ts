import { z } from 'zod';
import manifestJson from './config/manifest.json';
import marketsJson from './config/markets.json';
import productsJson from './config/products.json';
import accountJson from './config/account.json';
import marketExtrasJson from './config/market-extras.json';
import { marketSchema } from '@/types/market';
import { productsConfigSchema } from '@/types/product';
import { accountSchema } from '@/types/account';
import { commentsConfigSchema } from '@/types/marketExtras';

const manifestSchema = z
  .object({
    configVersion: z.literal(1),
    datasetVersion: z.string().min(1),
    seed: z.number().int().nonnegative(),
    fixedNow: z.iso.datetime(),
    locale: z.string().min(2),
    currency: z.literal('USD'),
    defaultScenario: z.enum([
      'success',
      'slow',
      'empty',
      'server-error',
      'stale',
      'rate-limit',
      'malformed',
      'fail-first',
    ]),
    latencyMs: z
      .object({ min: z.number().int().nonnegative(), max: z.number().int().nonnegative() })
      .strict(),
    pageSize: z.number().int().min(1).max(50),
  })
  .strict()
  .refine((config) => config.latencyMs.min <= config.latencyMs.max, {
    message: 'latencyMs.min must not exceed latencyMs.max',
  });

export const mockManifest = manifestSchema.parse(manifestJson);
export const configuredMarkets = z.array(marketSchema).min(1).parse(marketsJson);
export const productConfig = productsConfigSchema.parse(productsJson);
export const accountConfig = accountSchema.parse(accountJson);
export const marketExtrasConfig = commentsConfigSchema.parse(marketExtrasJson);

export function validateConfigReferences(
  markets: typeof configuredMarkets,
  products: typeof productConfig,
  account: typeof accountConfig,
  extras: typeof marketExtrasConfig,
) {
  const marketIds = new Set(markets.map((market) => market.id));
  if (marketIds.size !== markets.length) throw new Error('Market ids must be unique');
  if (new Set(markets.map((market) => market.slug)).size !== markets.length) {
    throw new Error('Market slugs must be unique');
  }
  for (const marketId of account.watchlistMarketIds) {
    if (!marketIds.has(marketId)) throw new Error(`Unknown account watchlist market: ${marketId}`);
  }
  for (const comment of extras.comments) {
    if (!marketIds.has(comment.marketId))
      throw new Error(`Unknown comment market: ${comment.marketId}`);
  }
  for (const market of markets) {
    if (new Set(market.outcomes.map((outcome) => outcome.id)).size !== market.outcomes.length) {
      throw new Error(`Outcome ids must be unique within market: ${market.id}`);
    }
    const probabilityTotal = market.outcomes.reduce((sum, outcome) => sum + outcome.probability, 0);
    if (probabilityTotal > 100 || (market.outcomes.length === 2 && probabilityTotal !== 100)) {
      throw new Error(`Outcome probabilities violate market invariants: ${market.id}`);
    }
  }
  for (const position of account.positions) {
    const market = markets.find((item) => item.id === position.marketId);
    if (!market) throw new Error(`Unknown position market: ${position.marketId}`);
    if (!market.outcomes.some((outcome) => outcome.id === position.outcomeId)) {
      throw new Error(`Unknown position outcome: ${position.marketId}/${position.outcomeId}`);
    }
  }
  const sportsEventIds = new Set(products.sports.events.map((event) => event.id));
  if (sportsEventIds.size !== products.sports.events.length) {
    throw new Error('Sports event ids must be unique');
  }
  for (const event of products.sports.events) {
    if (!products.sports.leagues.includes(event.league)) {
      throw new Error(`Unknown sports league: ${event.league}`);
    }
  }
  if (new Set(products.combos.map((leg) => leg.id)).size !== products.combos.length) {
    throw new Error('Combo leg ids must be unique');
  }
  for (const leg of products.combos) {
    const event = products.sports.events.find((item) => item.id === leg.eventId);
    if (!event) throw new Error(`Unknown combo event: ${leg.eventId}`);
    const allowed = [
      `${event.home.short} ${event.home.price}¢`,
      `${event.away.short} ${event.away.price}¢`,
      ...event.spread,
      ...event.total,
    ];
    if (!allowed.includes(leg.selection)) {
      throw new Error(`Unknown combo selection: ${leg.selection}`);
    }
  }
  if (new Set(products.perps.map((asset) => asset.symbol)).size !== products.perps.length) {
    throw new Error('Perps symbols must be unique');
  }
}

validateConfigReferences(configuredMarkets, productConfig, accountConfig, marketExtrasConfig);

export type MockScenario = typeof mockManifest.defaultScenario;
