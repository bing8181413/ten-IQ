import { z } from 'zod';

const bookLevelSchema = z
  .object({ price: z.number().int().min(1).max(99), shares: z.number().int().positive() })
  .strict();
export const orderBookResponseSchema = z
  .object({
    data: z
      .object({
        marketId: z.string(),
        outcomeId: z.string(),
        buys: z.array(bookLevelSchema),
        sells: z.array(bookLevelSchema),
        updatedAt: z.iso.datetime(),
        stale: z.boolean(),
        mode: z.literal('demo'),
      })
      .strict(),
  })
  .strict();

export const commentSchema = z
  .object({
    id: z.string(),
    marketId: z.string(),
    author: z.string(),
    text: z.string().min(1).max(280),
    createdAt: z.iso.datetime(),
  })
  .strict();
export const commentsConfigSchema = z.object({ comments: z.array(commentSchema) }).strict();
export const commentsResponseSchema = z
  .object({
    data: z.array(commentSchema),
    meta: z
      .object({
        total: z.number().int().nonnegative(),
        updatedAt: z.iso.datetime(),
        stale: z.boolean(),
      })
      .strict(),
  })
  .strict();
export const commentRequestSchema = z.object({ text: z.string().trim().min(1).max(280) }).strict();
export const commentResponseSchema = z
  .object({ data: commentSchema.extend({ mode: z.literal('demo') }) })
  .strict();

export type BookLevel = z.infer<typeof bookLevelSchema>;
