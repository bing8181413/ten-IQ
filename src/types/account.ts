import { z } from 'zod';

const positionSchema = z
  .object({
    marketId: z.string().regex(/^mkt-[a-z0-9-]+$/),
    outcomeId: z.string().regex(/^[a-z0-9-]+$/),
    market: z.string(),
    outcome: z.string(),
    probability: z.string(),
    value: z.string(),
    pnl: z.string(),
    state: z.string(),
  })
  .strict();
const activitySchema = z
  .object({ label: z.string(), detail: z.string(), time: z.string() })
  .strict();

export const accountSchema = z
  .object({
    name: z.string(),
    handle: z.string(),
    initials: z.string(),
    level: z.string(),
    balance: z.string(),
    available: z.string(),
    portfolioValue: z.string(),
    unrealizedPnl: z.string(),
    winRate: z.string(),
    rank: z.string(),
    openPositions: z.number().int().nonnegative(),
    watchlistMarketIds: z.array(z.string().regex(/^mkt-[a-z0-9-]+$/)),
    rewardsProgress: z.number().min(0).max(100),
    joined: z.string(),
    positions: z.array(positionSchema),
    activity: z.array(activitySchema),
  })
  .strict();

export const accountResponseSchema = z
  .object({
    data: accountSchema,
    meta: z
      .object({ mode: z.literal('demo'), updatedAt: z.iso.datetime(), stale: z.boolean() })
      .strict(),
  })
  .strict();

export type DemoAccount = z.infer<typeof accountSchema>;
