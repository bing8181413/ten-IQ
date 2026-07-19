import { marketListResponseSchema, marketResponseSchema } from '@/types/market';
import { apiGet } from './apiClient';

export interface MarketFilters {
  category?: string;
  sort?: 'trending' | 'volume' | 'newest';
  search?: string;
  topic?: string;
  status?: 'open' | 'live' | 'resolved' | 'closing';
  cursor?: string;
  limit?: number;
}
const mockSlugAliases: Record<string, string> = {
  'world-cup-winner': '2026-world-cup-winner',
};

export async function getMarkets(filters: MarketFilters = {}, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== '全部') params.set('category', filters.category);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.search) params.set('search', filters.search);
  if (filters.topic) params.set('topic', filters.topic);
  if (filters.status) params.set('status', filters.status);
  if (filters.cursor) params.set('cursor', filters.cursor);
  if (filters.limit) params.set('limit', String(filters.limit));
  const query = params.size > 0 ? `?${params.toString()}` : '';
  return apiGet(`/v1/markets${query}`, marketListResponseSchema, signal);
}

export async function getMarket(slug: string, signal?: AbortSignal) {
  const normalizedSlug = mockSlugAliases[slug] ?? slug;
  return apiGet(`/v1/markets/${encodeURIComponent(normalizedSlug)}`, marketResponseSchema, signal);
}
