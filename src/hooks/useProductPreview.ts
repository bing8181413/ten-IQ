import { createProductPreview } from '@/services/productPreviews';
import type { ProductPreviewRequest } from '@/types/api';
import { useActionMutation } from './useActionMutation';

export function useProductPreview() {
  return useActionMutation<ProductPreviewRequest, Awaited<ReturnType<typeof createProductPreview>>>(
    'demo-product-preview',
    createProductPreview,
  );
}
