import {
  combosResponseSchema,
  communityResponseSchema,
  perpsListResponseSchema,
  perpsResponseSchema,
  sportsResponseSchema,
  type CommunityPeriod,
} from '@/types/product';
import { apiGet } from './apiClient';

export function getSportsEvents(mode: 'live' | 'futures', league: string, signal?: AbortSignal) {
  const params = new URLSearchParams({ mode });
  if (league !== '全部') params.set('league', league);
  return apiGet(`/v1/sports/events?${params.toString()}`, sportsResponseSchema, signal);
}

export function getComboLegs(signal?: AbortSignal) {
  return apiGet('/v1/combos/legs', combosResponseSchema, signal);
}

export function getPerpsAssets(signal?: AbortSignal) {
  return apiGet('/v1/perps/assets', perpsListResponseSchema, signal);
}

export function getPerpsAsset(symbol: string, range: string, signal?: AbortSignal) {
  return apiGet(
    `/v1/perps/assets/${encodeURIComponent(symbol)}?range=${encodeURIComponent(range)}`,
    perpsResponseSchema,
    signal,
  );
}

export function getCommunity(
  view: 'leaderboard' | 'activity' | 'accuracy',
  period: CommunityPeriod,
  signal?: AbortSignal,
) {
  return apiGet(`/v1/community/${view}?period=${period}`, communityResponseSchema, signal);
}
