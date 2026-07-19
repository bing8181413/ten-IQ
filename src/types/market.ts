import { z } from 'zod';
export const outcomeSchema = z.object({
  id: z.string(),
  label: z.string(),
  probability: z.number().min(0).max(100),
  priceChange24h: z.number(),
});
export const marketStatusSchema = z.enum(['open', 'live', 'resolved', 'closing']);
export const marketSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  tags: z.array(z.string()),
  icon: z.string(),
  volume: z.number().nonnegative(),
  liquidity: z.number().nonnegative(),
  traders: z.number().int().nonnegative(),
  endDate: z.string(),
  status: marketStatusSchema,
  featured: z.boolean(),
  trending: z.boolean(),
  resolutionSource: z.string(),
  outcomes: z.array(outcomeSchema).min(2),
  sparkline: z.array(z.number().min(0).max(100)).min(2),
});
export const marketListResponseSchema = z.object({
  data: z.array(marketSchema),
  meta: z.object({ total: z.number().int().nonnegative(), updatedAt: z.string() }),
});
export const marketResponseSchema = z.object({ data: marketSchema });
export type Outcome = z.infer<typeof outcomeSchema>;
export type MarketStatus = z.infer<typeof marketStatusSchema>;
export type Market = z.infer<typeof marketSchema>;
