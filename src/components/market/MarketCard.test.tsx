import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { mockMarkets } from '@/data/mockMarkets';
import { MarketCard } from './MarketCard';
const market = mockMarkets[1];
if (!market) throw new Error('Test fixture missing');
describe('MarketCard', () => {
  it('renders market contract', () => {
    render(
      <MemoryRouter>
        <MarketCard market={market} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: market.title })).toBeInTheDocument();
    expect(screen.getByText(/交易量/)).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /收藏/ })).toBeDisabled();
  });
  it('reports selected outcome', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <MarketCard market={market} onOutcomeSelect={onSelect} />
      </MemoryRouter>,
    );
    await user.click(screen.getByRole('button', { name: /是/ }));
    expect(onSelect).toHaveBeenCalledWith(market, market.outcomes[0]);
  });
});
