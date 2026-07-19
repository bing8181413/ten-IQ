import { ApiError } from './apiClient';

export async function withIdempotentRetry<T>(operation: () => Promise<T>) {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    if (error instanceof ApiError && !error.retryable) throw error;
    return operation();
  }
}
