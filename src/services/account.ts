import { accountResponseSchema } from '@/types/account';
import { apiGet } from './apiClient';

export function getAccount(signal?: AbortSignal) {
  return apiGet('/v1/account', accountResponseSchema, signal);
}
