# Foretell Agent Operating Contract

This repository is an agent-governed prediction-market frontend. Treat this file as mandatory policy.

## Default behavior

The user may describe only a feature. Do not ask them to repeat the visual language, stack, testing policy, responsive requirements, or delivery workflow. Derive those constraints from this repository.

Before changing code, read:

1. `.codex/skills/prediction-market-ui/SKILL.md`
2. `.codex/skills/feature-delivery-workflow/SKILL.md`
3. `.codex/skills/design-review/SKILL.md`
4. `.codex/skills/quality-and-release/SKILL.md`
5. `docs/UI_SYSTEM.md`, `docs/ARCHITECTURE.md`, and relevant existing components

## Product identity

The interface is a probability marketplace: clean, compact, neutral, data-dense, market-first, card-based, and low decoration. It is not a casino, generic admin dashboard, crypto exchange terminal, illustration-heavy landing page, or default component-library skin.

Never copy Polymarket trademarks, logos, proprietary text, or unique branded assets. Preserve the interaction and visual grammar through this project's own brand and tokens.

## Mandatory feature workflow

For every non-trivial task, run:

```bash
pnpm run agent:new -- "feature name"
```

Maintain the generated task folder under `.agent/tasks/`. A non-trivial task changes behavior, UI, data contracts, routing, authentication, money-like flows, analytics, performance, security, or more than one source file.

### Gate 0 — Intake and evidence

- Restate the user problem in `brief.md`.
- Inspect existing code, contracts, tests, and decisions before proposing primitives.
- Resolve ambiguity from repository conventions where safe; record assumptions.
- Identify real-money, identity, privacy, regulatory, destructive-action, and abuse risks.

### Gate 1 — Product round

Record independent reviews from:

- Product manager: user value, scope, success metrics, edge cases.
- UX designer: journey, hierarchy, feedback, empty/loading/error states, mobile.
- Growth/business: discoverability, retention, analytics, incentives and abuse.

Each role returns `APPROVE`, `APPROVE-WITH-CHANGES`, or `REJECT`, with reasons. Resolve every `REJECT` before implementation.

### Gate 2 — Engineering round

Record independent reviews from:

- Frontend architect: component reuse, state boundaries, rendering, accessibility.
- Backend/API reviewer: schemas, errors, idempotency, compatibility, observability.
- Security/privacy reviewer: trust boundaries, secrets, PII, wallet/signing risk.
- SRE/operations reviewer: failure modes, feature flags, rollback, monitoring.

No implementation starts with unresolved `REJECT` decisions.

### Gate 3 — Plan and implementation

- Define data flow, component reuse map, API changes, test plan, rollout and rollback.
- Reuse semantic tokens and existing components before creating new ones.
- Keep domain logic out of presentation components.
- Validate external data with Zod at the service boundary.
- Add loading, empty, error, disabled, stale, responsive and keyboard states.
- Do not implement real trading, wallet signing, custody or payment behavior without a dedicated threat model and explicit human approval.

### Gate 4 — Adversarial validation

Run a fresh review round from:

- QA engineer: happy paths, edge cases and regression surface.
- Accessibility reviewer: keyboard, semantics, labels, contrast and motion.
- Performance reviewer: bundle, rendering, network and layout stability.
- Skeptical user: clarity, trust, accidental actions and misleading probability cues.

Record evidence in `qa.md`. A reviewer must challenge earlier assumptions rather than rubber-stamp them.

### Gate 5 — Quality and release

Run `pnpm run quality`. For UI changes, also run Storybook build and Playwright checks when the environment supports browsers. Update visual snapshots only after an intentional, approved design change.

Complete `release.md` with changed files, behavior, configuration, telemetry, rollback, known limitations and final approvals. Do not claim completion while a required command fails.

## UI contract

All visual values come from `src/design/globals.css` and `src/design/tokens.ts`.

Required reusable primitives:

- `Button`, `Card`, `Badge`, `Input`, `IconButton`, `Skeleton`
- `MarketCard`, `FeaturedMarketCard`, `OutcomeButton`, `MarketMeta`, `TopicChips`
- `ProbabilityChart`, `TradePanel`, `OrderBook`, `MarketTabs`

Do not introduce hard-coded colors, arbitrary radii, gradient decoration, oversized shadows, glassmorphism, neon Web3 styling, casino cues, or one-off market cards. `pnpm run design:check` enforces common violations.

New product UI must first map to one of:

- market discovery
- market card/list
- market detail
- trading panel
- topic/filter control
- portfolio/position list
- activity feed
- account/security panel

If it does not fit, add an ADR before implementation.

## Code boundaries

- `components/ui`: presentation primitives only.
- `components/market`: reusable prediction-market presentation.
- `components/trading`: order-intent UI; no signing or custody.
- `services`: HTTP and external integration boundaries.
- `types`: Zod schemas and inferred domain types.
- `hooks`: query orchestration.
- `stores`: ephemeral client interaction state only.
- `mocks`: deterministic development and test fixtures.

Do not fetch directly from page components. Do not put unvalidated server payloads into UI. Do not store secrets, tokens, wallet signatures or sensitive identifiers in local storage.

## Definition of done

A task is done only when behavior, tests, documentation, role reviews, accessibility, responsive layout, failure states, telemetry decision, rollout and rollback are addressed. Summaries must distinguish verified results from assumptions.
