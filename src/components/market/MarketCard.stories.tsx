import { MemoryRouter } from 'react-router-dom';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockMarkets } from '@/data/mockMarkets';
import { MarketCard } from './MarketCard';
const market = mockMarkets[1];
if (!market) throw new Error('Story fixture missing');
const meta = {
  title: 'Market/MarketCard',
  component: MarketCard,
  tags: ['autodocs'],
  args: { market },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div className="w-[360px]">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof MarketCard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const BinaryMarket: Story = {};
