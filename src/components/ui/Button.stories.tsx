import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: { children: '开始使用' },
} satisfies Meta<typeof Button>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Primary: Story = {};
export const Outline: Story = { args: { variant: 'outline' } };
export const Probability: Story = { args: { variant: 'yes', children: '是 42%' } };
