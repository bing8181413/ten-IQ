import type { ZodType } from 'zod';
import { apiErrorSchema } from '@/types/api';
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
    readonly retryable: boolean,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
interface ApiRequestOptions<T> {
  method?: 'GET' | 'POST' | 'PATCH';
  body?: unknown;
  schema: ZodType<T>;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

async function parsePayload(response: Response) {
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new ApiError('服务器返回了无法解析的响应', response.status, 'INVALID_RESPONSE', false);
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions<T>) {
  const method = options.method ?? 'GET';
  const scenario =
    (import.meta.env.DEV || import.meta.env.MODE === 'demo') && typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('__scenario')
      : null;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(scenario ? { 'X-Mock-Scenario': scenario } : {}),
      ...options.headers,
    },
    ...(options.body === undefined ? {} : { body: JSON.stringify(options.body) }),
    ...(options.signal ? { signal: options.signal } : {}),
  });
  const payload = await parsePayload(response);
  if (!response.ok) {
    const parsed = apiErrorSchema.safeParse(payload);
    if (!parsed.success) {
      throw new ApiError(
        `请求失败：${response.status}`,
        response.status,
        'UNKNOWN',
        false,
        payload,
      );
    }
    throw new ApiError(
      parsed.data.error.message,
      response.status,
      parsed.data.error.code,
      parsed.data.error.retryable,
      parsed.data.error.details,
    );
  }
  const parsed = options.schema.safeParse(payload);
  if (!parsed.success) {
    throw new ApiError(
      '服务器响应不符合契约',
      response.status,
      'INVALID_RESPONSE',
      false,
      parsed.error.issues,
    );
  }
  return parsed.data;
}

export function apiGet<T>(path: string, schema: ZodType<T>, signal?: AbortSignal) {
  return apiRequest(path, { schema, ...(signal ? { signal } : {}) });
}
