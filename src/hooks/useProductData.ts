import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getComboLegs,
  getCommunity,
  getPerpsAsset,
  getPerpsAssets,
  getSportsEvents,
} from '@/services/products';
import type { CommunityPeriod } from '@/types/product';

export function useSportsEvents(mode: 'live' | 'futures', league: string) {
  return useQuery({
    queryKey: ['sports', mode, league],
    queryFn: ({ signal }) => getSportsEvents(mode, league, signal),
    placeholderData: keepPreviousData,
  });
}

export function useComboLegs() {
  return useQuery({ queryKey: ['combos', 'legs'], queryFn: ({ signal }) => getComboLegs(signal) });
}

export function usePerpsAssets() {
  return useQuery({
    queryKey: ['perps', 'assets'],
    queryFn: ({ signal }) => getPerpsAssets(signal),
  });
}

export function usePerpsAsset(symbol: string, range: string) {
  return useQuery({
    queryKey: ['perps', 'asset', symbol, range],
    queryFn: ({ signal }) => getPerpsAsset(symbol, range, signal),
    retry: false,
  });
}

export function useCommunityData(
  view: 'leaderboard' | 'activity' | 'accuracy',
  period: CommunityPeriod,
) {
  return useQuery({
    queryKey: ['community', view, period],
    queryFn: ({ signal }) => getCommunity(view, period, signal),
    placeholderData: keepPreviousData,
  });
}
