import { tradePreviewResponseSchema, type TradePreviewRequest } from '@/types/api';
import { apiRequest } from './apiClient';
import { withIdempotentRetry } from './idempotentRetry';

export function createTradePreview(
  request: TradePreviewRequest,
  idempotencyKey: string,
  signal?: AbortSignal,
) {
  return withIdempotentRetry(() =>
    apiRequest('/v1/previews/trades', {
      method: 'POST',
      body: request,
      schema: tradePreviewResponseSchema,
      headers: { 'Idempotency-Key': idempotencyKey },
      ...(signal ? { signal } : {}),
    }),
  );
}
