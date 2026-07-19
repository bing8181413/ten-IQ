import { describe, expect, it } from 'vitest';
import { formatProbability, formatSignedPercent } from './format';
describe('format helpers', () => {
  it('formats probability', () => expect(formatProbability(42.4)).toBe('42%'));
  it('formats signed percent', () => expect(formatSignedPercent(2.1)).toBe('+2.1%'));
});
