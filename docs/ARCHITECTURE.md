# Architecture

## Layers

```text
pages -> hooks -> services -> HTTP
pages -> domain components -> UI primitives
types/Zod validates every external payload
stores hold only ephemeral interaction state
```

## Decisions

- React Query owns server state, cache and cancellation.
- Zustand owns short-lived trade-form state.
- Zod parses external responses at the service boundary.
- MSW provides deterministic browser and test mocks.
- Route-level lazy loading limits initial page code.
- Tailwind semantic tokens prevent visual drift.

## Dependency direction

UI primitives do not import market domain code. Market components may import UI primitives. Pages orchestrate components but do not fetch directly. Trading components do not sign, submit, custody or persist real orders.

## Extension points

- Replace `services/markets.ts` with a generated or typed API client.
- Add authentication through an adapter/provider.
- Add analytics through `lib/analytics.ts`.
- Introduce feature flags before staged rollout.
- Put server code in a separate service or workspace; keep shared schemas versioned.
