import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { mockMarkets } from '@/data/mockMarkets';
import { useTradeStore } from '@/stores/tradeStore';
import { TradePanel } from './TradePanel';
const market = mockMarkets[1];
if (!market) throw new Error('Test fixture missing');
describe('TradePanel', () => {
  beforeEach(() => useTradeStore.getState().reset());
  it('updates preview amount', async () => {
    const user = userEvent.setup();
    render(<TradePanel market={market} />);
    const input = screen.getByLabelText('金额');
    await user.clear(input);
    await user.type(input, '50');
    expect(input).toHaveValue('50');
    expect(screen.getByText('预计份额')).toBeInTheDocument();
  });
});
