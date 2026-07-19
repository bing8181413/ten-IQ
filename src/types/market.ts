import { z } from 'zod';
export const outcomeSchema = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    label: z.string().min(1),
    probability: z.number().min(0).max(100),
    priceChange24h: z.number(),
  })
  .strict();
export const marketStatusSchema = z.enum(['open', 'live', 'resolved', 'closing']);
export const marketSchema = z
  .object({
    id: z.string().regex(/^mkt-[a-z0-9-]+$/),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.string().min(1),
    tags: z.array(z.string().min(1)),
    icon: z.string().regex(/^[a-z0-9-]+$/),
    volume: z.number().nonnegative(),
    liquidity: z.number().nonnegative(),
    traders: z.number().int().nonnegative(),
    endDate: z.iso.datetime(),
    status: marketStatusSchema,
    featured: z.boolean(),
    trending: z.boolean(),
    resolutionSource: z.string(),
    outcomes: z
      .array(outcomeSchema)
      .min(2)
      .refine(
        (outcomes) => new Set(outcomes.map((outcome) => outcome.id)).size === outcomes.length,
        {
          message: 'Outcome ids must be unique',
        },
      ),
    sparkline: z.array(z.number().min(0).max(100)).min(2),
  })
  .strict();
export const marketListResponseSchema = z
  .object({
    data: z.array(marketSchema),
    meta: z
      .object({
        total: z.number().int().nonnegative(),
        updatedAt: z.iso.datetime(),
        stale: z.boolean(),
        nextCursor: z.string().nullable(),
        hasMore: z.boolean(),
      })
      .strict(),
  })
  .strict();
export const marketResponseSchema = z
  .object({
    data: marketSchema,
    meta: z.object({ updatedAt: z.iso.datetime(), stale: z.boolean() }).strict(),
  })
  .strict();
export type Outcome = z.infer<typeof outcomeSchema>;
export type MarketStatus = z.infer<typeof marketStatusSchema>;
export type Market = z.infer<typeof marketSchema>;
