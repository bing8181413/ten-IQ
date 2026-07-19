export const designTokens = {
  color: {
    canvas: '#ffffff',
    surface: '#ffffff',
    surfaceMuted: '#f4f5f6',
    border: '#e6e8ea',
    foreground: '#111418',
    muted: '#596579',
    subtle: '#7a8494',
    brand: '#1452f0',
    brandSoft: '#eaf2ff',
    positive: '#087443',
    positiveSoft: '#eaf8f2',
    negative: '#a82d38',
    negativeSoft: '#fff0f1',
    warning: '#8a4b00',
    warningSoft: '#fff7e8',
  },
  radius: { control: '8px', card: '12px', panel: '14px' },
  layout: { contentMax: '1280px', sidebar: '320px', header: '64px' },
  motion: { fast: '120ms', normal: '160ms' },
} as const;
export type DesignTokens = typeof designTokens;
