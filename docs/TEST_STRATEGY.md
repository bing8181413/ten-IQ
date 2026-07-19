# Test strategy

## Unit/component

Vitest and Testing Library cover formatting, component contracts, user interactions and state changes. Tests query by role/label rather than implementation classes.

## Contract

Zod schemas reject malformed API data. Add fixture tests when schemas evolve.

## Storybook

Stories document primitives and market/trading states. The a11y addon treats violations as errors.

## E2E

Playwright covers discovery, detail/rules, mobile behavior and axe checks. Visual snapshots detect layout and styling drift.

## Release rule

A production issue needs a regression test at the lowest reliable layer. Flaky tests are fixed or quarantined with an owner and expiry; they are not silently retried forever.
