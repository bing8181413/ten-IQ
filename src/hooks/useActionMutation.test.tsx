import { act, renderHook } from '@testing-library/react';
import { AppProviders } from '@/app/AppProviders';
import { resetActionIdsForTests } from '@/lib/requestId';
import { useActionMutation } from './useActionMutation';

describe('useActionMutation', () => {
  it('reuses the failed action id for retry and allocates a new id after success', async () => {
    resetActionIdsForTests();
    const ids: string[] = [];
    let shouldFail = true;
    const operation = (_value: { amount: number }, id: string) => {
      ids.push(id);
      if (shouldFail) {
        shouldFail = false;
        return Promise.reject(new TypeError('response lost'));
      }
      return Promise.resolve(id);
    };
    const { result } = renderHook(() => useActionMutation('preview', operation), {
      wrapper: AppProviders,
    });
    await expect(result.current.mutateAsync({ amount: 10 })).rejects.toThrow('response lost');
    await act(async () => {
      await result.current.mutateAsync({ amount: 10 });
    });
    await act(async () => {
      await result.current.mutateAsync({ amount: 10 });
    });
    expect(ids[1]).toBe(ids[0]);
    expect(ids[2]).not.toBe(ids[1]);
  });
});
