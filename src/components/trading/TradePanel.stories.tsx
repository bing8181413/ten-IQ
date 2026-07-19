import type { Meta, StoryObj } from '@storybook/react-vite';
import { mockMarkets } from '@/data/mockMarkets';
import { TradePanel } from './TradePanel';
const market = mockMarkets[1];
if (!market) throw new Error('Story fixture missing');
const meta = {
  title: 'Trading/TradePanel',
  component: TradePanel,
  tags: ['autodocs'],
  args: { market },
  decorators: [
    (Story) => (
      <div className="w-[340px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TradePanel>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
