import type { ZodType } from 'zod';
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
export async function apiGet<T>(path: string, schema: ZodType<T>, signal?: AbortSignal) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    ...(signal ? { signal } : {}),
  });
  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = undefined;
    }
    throw new ApiError(`Request failed: ${response.status}`, response.status, details);
  }
  const payload: unknown = await response.json();
  return schema.parse(payload);
}
