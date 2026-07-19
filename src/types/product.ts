import { z } from 'zod';

const teamSchema = z
  .object({
    name: z.string().min(1),
    short: z.string().min(2).max(5),
    score: z.string(),
    price: z.number().min(1).max(99),
  })
  .strict();

export const sportsEventSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    mode: z.enum(['live', 'futures']),
    league: z.string().min(1),
    status: z.string().min(1),
    volume: z.string().min(1),
    home: teamSchema,
    away: teamSchema,
    spread: z.tuple([z.string(), z.string()]),
    total: z.tuple([z.string(), z.string()]),
  })
  .strict();

export const comboLegSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    eventId: z.string().regex(/^[a-z0-9-]+$/),
    selection: z.string().min(1),
    league: z.string().min(1),
    title: z.string().min(1),
    outcome: z.string().min(1),
    probability: z.number().min(1).max(99),
  })
  .strict();

export const perpsAssetSchema = z
  .object({
    symbol: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    icon: z.string().min(1),
    price: z.number().positive(),
    change: z.number(),
    high: z.string(),
    low: z.string(),
    volume: z.string(),
    values: z.array(z.number().positive()).min(5),
    depth: z
      .object({
        buys: z.array(
          z.object({ price: z.number().positive(), size: z.number().positive() }).strict(),
        ),
        sells: z.array(
          z.object({ price: z.number().positive(), size: z.number().positive() }).strict(),
        ),
      })
      .strict(),
  })
  .strict();

const periodSchema = z.enum(['today', 'week', 'month']);
const leaderboardRowSchema = z.tuple([z.string(), z.string(), z.string()]);
const activityRowSchema = z.tuple([z.string(), z.string(), z.string()]);
const accuracySchema = z
  .object({
    score: z.number().min(0).max(1),
    buckets: z.array(z.tuple([z.string(), z.string(), z.number().min(0).max(100)])),
  })
  .strict();

export const productsConfigSchema = z
  .object({
    sports: z.object({ leagues: z.array(z.string()), events: z.array(sportsEventSchema) }).strict(),
    combos: z.array(comboLegSchema),
    perps: z.array(perpsAssetSchema),
    community: z
      .object({
        leaderboard: z.record(periodSchema, z.array(leaderboardRowSchema)),
        activity: z.record(periodSchema, z.array(activityRowSchema)),
        accuracy: z.record(periodSchema, accuracySchema),
      })
      .strict(),
  })
  .strict();

export const sportsResponseSchema = z
  .object({
    data: z.array(sportsEventSchema),
    meta: z
      .object({ leagues: z.array(z.string()), updatedAt: z.iso.datetime(), stale: z.boolean() })
      .strict(),
  })
  .strict();
const freshnessMetaSchema = z.object({ updatedAt: z.iso.datetime(), stale: z.boolean() }).strict();
export const combosResponseSchema = z
  .object({ data: z.array(comboLegSchema), meta: freshnessMetaSchema })
  .strict();
export const perpsListResponseSchema = z
  .object({ data: z.array(perpsAssetSchema), meta: freshnessMetaSchema })
  .strict();
export const perpsResponseSchema = z
  .object({ data: perpsAssetSchema, meta: freshnessMetaSchema })
  .strict();
const communityMeta = (view: 'leaderboard' | 'activity' | 'accuracy') =>
  z
    .object({
      view: z.literal(view),
      period: periodSchema,
      updatedAt: z.iso.datetime(),
      stale: z.boolean(),
    })
    .strict();
export const communityResponseSchemas = {
  leaderboard: z
    .object({ data: z.array(leaderboardRowSchema), meta: communityMeta('leaderboard') })
    .strict(),
  activity: z
    .object({ data: z.array(activityRowSchema), meta: communityMeta('activity') })
    .strict(),
  accuracy: z.object({ data: accuracySchema, meta: communityMeta('accuracy') }).strict(),
};
export const communityResponseSchema = z.union([
  communityResponseSchemas.leaderboard,
  communityResponseSchemas.activity,
  communityResponseSchemas.accuracy,
]);

export type SportsEvent = z.infer<typeof sportsEventSchema>;
export type ComboLeg = z.infer<typeof comboLegSchema>;
export type PerpsAsset = z.infer<typeof perpsAssetSchema>;
export type CommunityPeriod = z.infer<typeof periodSchema>;
