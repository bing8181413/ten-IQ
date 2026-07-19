import type { Preview } from '@storybook/react-vite';
import '../src/design/globals.css';

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    a11y: { test: 'error' },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-canvas p-6 text-foreground">
        <Story />
      </div>
    ),
  ],
};
export default preview;
