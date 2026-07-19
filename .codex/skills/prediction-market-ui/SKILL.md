---
name: prediction-market-ui
description: Build and extend Foretell's Polymarket-inspired prediction-market interface while preserving strict visual and interaction consistency.
---

# Prediction Market UI

## Trigger

Use this skill for every page, component, navigation, discovery, market, chart, order-intent, portfolio, account or responsive UI task in this repository.

## Product grammar

The product is a probability marketplace. Every screen should prioritize event understanding, probability, liquidity, time, outcome selection and trust.

Use these qualities:

- compact and data-dense
- neutral surfaces and subtle borders
- market cards over marketing blocks
- probabilities as the primary visual signal
- restrained brand blue
- small, deliberate hover/focus feedback
- clear rules and resolution sources

Never drift into:

- casino styling, gold, neon or celebratory confetti
- crypto exchange terminal density
- generic admin dashboards
- oversized hero sections or illustration-heavy landing pages
- glassmorphism, decorative gradients or heavy shadows
- default Ant Design, Chakra, Material or Bootstrap appearance

## Mandatory token use

Read `src/design/globals.css` and `src/design/tokens.ts`. Use semantic utilities such as:

- `bg-canvas`, `bg-surface`, `bg-surface-muted`
- `text-foreground`, `text-muted`, `text-brand`
- `border-border`, `border-border-strong`
- `rounded-control`, `rounded-card`, `rounded-panel`
- `shadow-card`, `shadow-popover`

Do not add literal colors or arbitrary radius/shadow values in components.

## Component reuse order

Before creating a component, search in this order:

1. `src/components/ui`
2. `src/components/market`
3. `src/components/trading`
4. Storybook stories and tests

Extend variants before duplicating markup. New primitives require a design decision in the active `.agent/tasks/*/plan.md`; cross-cutting primitives require an ADR.

## Required states

Every data-driven surface must include:

- skeleton/loading
- empty
- error and retry
- success
- disabled or unavailable behavior
- desktop and mobile behavior
- keyboard focus
- reduced-motion behavior

## Market card contract

A market card contains:

- compact icon/avatar
- category
- two-line event title
- one to four outcome rows
- probability values
- volume and state metadata
- subtle border interaction

It is not a blog card, product card or promo tile.

## Outcome controls

Outcome controls are compact rectangular controls. Selected/primary outcomes use brand tokens. Neutral alternatives use surface tokens. Red is reserved for loss/error/destructive semantics, not for every “No” choice.

## Responsive rules

- Desktop content max width: 1280px.
- Desktop detail/discovery layouts use a 320–340px right rail.
- Mobile uses one content column, horizontal category chips and bottom navigation.
- Keep primary information visible without hover.
- Minimum interactive height is 40px except deliberately compact filter controls.

## New feature taste check

Classify the feature as one of: market discovery, market card/list, market detail, trading panel, topic/filter, portfolio, activity feed or account/security. Reuse the closest visual pattern. If none fits, stop and write an ADR rather than improvising a new style.

## Verification

Run:

```bash
pnpm run design:check
pnpm run typecheck
pnpm run test:run
pnpm run build:storybook
```
