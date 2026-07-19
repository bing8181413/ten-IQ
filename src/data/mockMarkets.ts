import { configuredMarkets } from '@/mock-backend/config';

/** @deprecated Product code must use services/hooks. Kept for Storybook and fixture compatibility. */
export const mockMarkets = configuredMarkets;

export const topicCounts = [
  { label: '加密', count: 126 },
  { label: '体育', count: 94 },
  { label: 'AI', count: 73 },
  { label: '经济', count: 61 },
  { label: '科技', count: 48 },
];
