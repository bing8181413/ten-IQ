# ADR 0001: Frontend stack

Status: Accepted

## Decision

Use React, TypeScript, Vite, Tailwind semantic tokens, Radix primitives, React Query, Zod, Zustand and MSW.

## Rationale

The stack supports headless accessible components, strict contracts, fast iteration, route splitting and deterministic mocks without imposing a visible component-library skin.

## Consequences

The team maintains its own visual primitives and must resist one-off Tailwind values. API payloads are parsed at runtime. Browser tests require Playwright browser binaries in CI.
