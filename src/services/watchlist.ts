import { watchlistMutationResponseSchema, watchlistResponseSchema } from '@/types/api';
import { apiGet, apiRequest } from './apiClient';

export function getWatchlist(signal?: AbortSignal) {
  return apiGet('/v1/watchlist', watchlistResponseSchema, signal);
}

export function setWatchlist(marketId: string, active: boolean, revision: number) {
  return apiRequest(`/v1/watchlist/${encodeURIComponent(marketId)}`, {
    method: 'PATCH',
    body: { active },
    headers: { 'If-Match': String(revision) },
    schema: watchlistMutationResponseSchema,
  });
}
