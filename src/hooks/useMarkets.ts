import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { getMarket, getMarkets, type MarketFilters } from '@/services/markets';
export const marketKeys = {
  all: ['markets'] as const,
  list: (filters: MarketFilters) => ['markets', 'list', filters] as const,
  detail: (slug: string) => ['markets', 'detail', slug] as const,
};
export function useMarkets(filters: MarketFilters) {
  return useQuery({
    queryKey: marketKeys.list(filters),
    queryFn: ({ signal }) => getMarkets(filters, signal),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });
}
export function useMarket(slug: string) {
  return useQuery({
    queryKey: marketKeys.detail(slug),
    queryFn: ({ signal }) => getMarket(slug, signal),
    staleTime: 15000,
  });
}

export function useInfiniteMarkets(filters: MarketFilters) {
  return useInfiniteQuery({
    queryKey: [...marketKeys.list(filters), 'infinite'],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ signal, pageParam }) =>
      getMarkets({ ...filters, ...(pageParam ? { cursor: pageParam } : {}), limit: 6 }, signal),
    getNextPageParam: (lastPage) => lastPage.meta.nextCursor ?? undefined,
    staleTime: 30_000,
  });
}
