import { vi } from 'vitest';
import { withIdempotentRetry } from './idempotentRetry';

describe('withIdempotentRetry', () => {
  it('retries a network failure once within the same action', async () => {
    const operation = vi.fn().mockRejectedValueOnce(new TypeError('lost')).mockResolvedValue('ok');
    await expect(withIdempotentRetry(operation)).resolves.toBe('ok');
    expect(operation).toHaveBeenCalledTimes(2);
  });
});
