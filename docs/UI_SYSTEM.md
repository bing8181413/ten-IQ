# UI system

## Visual DNA

Clean, compact, neutral, data-dense, card-based and probability-driven. White surfaces sit on a light neutral canvas. Borders provide hierarchy; shadows are minimal. Brand blue is reserved for active states, probabilities and primary actions.

## Token policy

All colors, radii and shadows live in `src/design/globals.css`; `src/design/tokens.ts` mirrors values for non-CSS integrations. Components use semantic utilities rather than literal values.

## Typography

- Page title: 24–30px, bold.
- Section title: 18px, semibold.
- Market title: 15–18px, semibold.
- Probability: 18–32px, bold and tabular.
- Metadata: 12–14px.

## Density

- Controls normally use 40–44px height.
- Cards use 14px radius and 16–20px padding.
- Grids use 12px gaps.
- Avoid large empty promotional sections.

## Component contracts

`MarketCard` owns event identity, outcomes and metadata. `OutcomeButton` owns probability selection. `TradePanel` represents intent only. New features reuse these contracts or document an ADR.

## Forbidden patterns

Casino colors, neon, gold, glassmorphism, oversized gradients, heavy shadows, illustration-led landing pages, default component-library skins, color-only meaning and arbitrary one-off cards.
