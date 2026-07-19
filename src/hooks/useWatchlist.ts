import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getWatchlist, setWatchlist } from '@/services/watchlist';

export const watchlistKey = ['account', 'watchlist'] as const;

export function useWatchlist() {
  return useQuery({
    queryKey: watchlistKey,
    queryFn: ({ signal }) => getWatchlist(signal),
    staleTime: 15_000,
  });
}

export function useWatchlistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ marketId, active }: { marketId: string; active: boolean }) => {
      const current =
        queryClient.getQueryData<Awaited<ReturnType<typeof getWatchlist>>>(watchlistKey);
      if (!current) throw new Error('关注列表尚未加载');
      return setWatchlist(marketId, active, current.data.revision);
    },
    onMutate: async ({ marketId, active }) => {
      await queryClient.cancelQueries({ queryKey: watchlistKey });
      const previous =
        queryClient.getQueryData<Awaited<ReturnType<typeof getWatchlist>>>(watchlistKey);
      queryClient.setQueryData<Awaited<ReturnType<typeof getWatchlist>>>(
        watchlistKey,
        (current) => {
          if (!current) return current;
          const ids = new Set(current.data.marketIds);
          if (active) ids.add(marketId);
          else ids.delete(marketId);
          return { ...current, data: { ...current.data, marketIds: [...ids] } };
        },
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) queryClient.setQueryData(watchlistKey, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: watchlistKey }),
  });
}
