import { marketListResponseSchema, marketResponseSchema } from '@/types/market';
import { mockMarkets } from '@/data/mockMarkets';
import { apiGet } from './apiClient';

export interface MarketFilters {
  category?: string;
  sort?: 'trending' | 'volume' | 'newest';
  search?: string;
}

const useMockFallback = import.meta.env.VITE_USE_MOCKS === 'true';
const mockSlugAliases: Record<string, string> = {
  'world-cup-winner': '2026-world-cup-winner',
};

function getMockMarkets(filters: MarketFilters = {}) {
  const search = filters.search?.trim().toLocaleLowerCase('zh-CN');
  let data = mockMarkets.filter((market) => {
    const matchesCategory =
      !filters.category ||
      filters.category === '全部' ||
      (filters.category === '热门' ? market.trending : market.category === filters.category);
    const matchesSearch =
      !search ||
      market.title.toLocaleLowerCase('zh-CN').includes(search) ||
      market.tags.some((tag) => tag.toLocaleLowerCase('zh-CN').includes(search));
    return matchesCategory && matchesSearch;
  });
  data = [...data].sort((a, b) =>
    filters.sort === 'volume'
      ? b.volume - a.volume
      : filters.sort === 'newest'
        ? b.endDate.localeCompare(a.endDate)
        : Number(b.trending) - Number(a.trending) || b.volume - a.volume,
  );
  return marketListResponseSchema.parse({
    data,
    meta: { total: data.length, updatedAt: new Date().toISOString() },
  });
}

function getMockMarket(slug: string) {
  const normalizedSlug = mockSlugAliases[slug] ?? slug;
  const market = mockMarkets.find((item) => item.slug === normalizedSlug);
  if (!market) throw new Error('Market not found');
  return marketResponseSchema.parse({ data: market });
}

export async function getMarkets(filters: MarketFilters = {}, signal?: AbortSignal) {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== '全部') params.set('category', filters.category);
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.search) params.set('search', filters.search);
  const query = params.size > 0 ? `?${params.toString()}` : '';
  try {
    return await apiGet(`/markets${query}`, marketListResponseSchema, signal);
  } catch (error) {
    if (!useMockFallback) throw error;
    return getMockMarkets(filters);
  }
}

export async function getMarket(slug: string, signal?: AbortSignal) {
  const normalizedSlug = mockSlugAliases[slug] ?? slug;
  try {
    return await apiGet(
      `/markets/${encodeURIComponent(normalizedSlug)}`,
      marketResponseSchema,
      signal,
    );
  } catch (error) {
    if (!useMockFallback) throw error;
    return getMockMarket(normalizedSlug);
  }
}
