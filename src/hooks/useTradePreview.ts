import { createTradePreview } from '@/services/previews';
import type { TradePreviewRequest } from '@/types/api';
import { useActionMutation } from './useActionMutation';

export function useTradePreview() {
  return useActionMutation<TradePreviewRequest, Awaited<ReturnType<typeof createTradePreview>>>(
    'demo-trade-preview',
    createTradePreview,
  );
}
