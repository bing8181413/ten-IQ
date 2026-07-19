import { describe, expect, it } from 'vitest';
import { marketCategories } from './TopicChips';

describe('marketCategories', () => {
  it('exposes the target-style homepage topic strip', () => {
    expect(marketCategories).toContain('全部');
    expect(marketCategories).toContain('特朗普');
    expect(marketCategories).toContain('AI');
    expect(marketCategories).toContain('Tweet Markets');
    expect(marketCategories).not.toContain('2026年NHL选秀');
  });
});
