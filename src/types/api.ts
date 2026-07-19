import { z } from 'zod';

export const apiErrorCodeSchema = z.enum([
  'BAD_REQUEST',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'VALIDATION_ERROR',
  'INTERNAL_ERROR',
]);

export const apiErrorSchema = z
  .object({
    error: z
      .object({
        code: apiErrorCodeSchema,
        message: z.string(),
        requestId: z.string(),
        retryable: z.boolean(),
        details: z.unknown().optional(),
      })
      .strict(),
  })
  .strict();

export const tradePreviewRequestSchema = z
  .object({
    marketId: z.string().regex(/^mkt-[a-z0-9-]+$/),
    outcomeId: z.string().regex(/^[a-z0-9-]+$/),
    side: z.enum(['buy', 'sell']),
    amount: z.number().positive().max(10000),
  })
  .strict();

export const tradePreviewResponseSchema = z
  .object({
    data: z
      .object({
        id: z.string(),
        mode: z.literal('demo'),
        marketId: z.string(),
        outcomeId: z.string(),
        side: z.enum(['buy', 'sell']),
        amount: z.number(),
        averagePrice: z.number().min(1).max(99),
        estimatedShares: z.number().nonnegative(),
        maxPayout: z.number().nonnegative(),
        priceImpact: z.number().nonnegative(),
        createdAt: z.iso.datetime(),
        expiresAt: z.iso.datetime(),
      })
      .strict(),
  })
  .strict();

export type ApiErrorPayload = z.infer<typeof apiErrorSchema>;
export type TradePreviewRequest = z.infer<typeof tradePreviewRequestSchema>;

export const watchlistResponseSchema = z
  .object({
    data: z
      .object({
        marketIds: z.array(z.string().regex(/^mkt-[a-z0-9-]+$/)),
        revision: z.number().int().positive(),
        mode: z.literal('demo'),
        updatedAt: z.iso.datetime(),
      })
      .strict(),
  })
  .strict();

export const watchlistMutationResponseSchema = z
  .object({
    data: z
      .object({
        marketId: z.string().regex(/^mkt-[a-z0-9-]+$/),
        active: z.boolean(),
        revision: z.number().int().positive(),
        mode: z.literal('demo'),
        updatedAt: z.iso.datetime(),
      })
      .strict(),
  })
  .strict();

export const productPreviewRequestSchema = z.discriminatedUnion('kind', [
  z
    .object({
      kind: z.literal('sports'),
      selection: z.string().min(1).max(160),
      amount: z.number().positive().max(10000).default(10),
    })
    .strict(),
  z
    .object({
      kind: z.literal('combo'),
      legIds: z.array(z.string()).min(2).max(4),
      amount: z.number().positive().max(10000),
    })
    .strict(),
  z
    .object({
      kind: z.literal('perps'),
      symbol: z.string().regex(/^[a-z0-9-]{1,24}$/),
      side: z.enum(['long', 'short']),
      amount: z.number().positive().max(10000),
    })
    .strict(),
]);

export const productPreviewResponseSchema = z
  .object({
    data: z
      .object({
        id: z.string(),
        kind: z.enum(['sports', 'combo', 'perps']),
        summary: z.string(),
        estimatedReturn: z.number().nonnegative(),
        mode: z.literal('demo'),
        createdAt: z.iso.datetime(),
        expiresAt: z.iso.datetime(),
      })
      .strict(),
  })
  .strict();

export type ProductPreviewRequest = z.infer<typeof productPreviewRequestSchema>;
