import { createProductPreview } from './productPreviews';

describe('product preview service', () => {
  it('sends an idempotent sports preview request through MSW', async () => {
    const response = await createProductPreview(
      {
        kind: 'sports',
        selection: 'spain-argentina:ESP 60¢',
        amount: 10,
      },
      'service-test-action-1',
    );
    expect(response.data.kind).toBe('sports');
    expect(response.data.mode).toBe('demo');
  });

  it('reuses one action key but allows a new identical action', async () => {
    const request = {
      kind: 'sports' as const,
      selection: 'spain-argentina:ESP 60¢',
      amount: 10,
    };
    const first = await createProductPreview(request, 'same-action');
    const retry = await createProductPreview(request, 'same-action');
    const nextAction = await createProductPreview(request, 'next-action');
    expect(retry).toEqual(first);
    expect(nextAction.data.id).not.toBe(first.data.id);
  });
});
