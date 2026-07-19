import {
  commentResponseSchema,
  commentsResponseSchema,
  orderBookResponseSchema,
} from '@/types/marketExtras';
import { apiGet, apiRequest } from './apiClient';
import { withIdempotentRetry } from './idempotentRetry';

export function getOrderBook(marketId: string, outcomeId: string, signal?: AbortSignal) {
  return apiGet(
    `/v1/markets/${encodeURIComponent(marketId)}/order-book?outcomeId=${encodeURIComponent(outcomeId)}`,
    orderBookResponseSchema,
    signal,
  );
}

export function getComments(marketId: string, signal?: AbortSignal) {
  return apiGet(
    `/v1/markets/${encodeURIComponent(marketId)}/comments`,
    commentsResponseSchema,
    signal,
  );
}

export function createComment(marketId: string, text: string, idempotencyKey: string) {
  return withIdempotentRetry(() =>
    apiRequest(`/v1/markets/${encodeURIComponent(marketId)}/comments`, {
      method: 'POST',
      body: { text },
      headers: { 'Idempotency-Key': idempotencyKey },
      schema: commentResponseSchema,
    }),
  );
}
