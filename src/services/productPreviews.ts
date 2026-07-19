import { productPreviewResponseSchema, type ProductPreviewRequest } from '@/types/api';
import { apiRequest } from './apiClient';
import { withIdempotentRetry } from './idempotentRetry';

export function createProductPreview(request: ProductPreviewRequest, idempotencyKey: string) {
  const route = request.kind === 'combo' ? 'combos' : request.kind;
  return withIdempotentRetry(() =>
    apiRequest(`/v1/previews/${route}`, {
      method: 'POST',
      body: request,
      headers: { 'Idempotency-Key': idempotencyKey },
      schema: productPreviewResponseSchema,
    }),
  );
}
