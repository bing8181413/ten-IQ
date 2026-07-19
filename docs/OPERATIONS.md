# Operations

## Environments

Development uses MSW. Demo builds use `.env.demo`. Production builds exclude MSW unless explicitly enabled.

## Health and observability

The static frontend should expose deployment metadata. API services need readiness/liveness checks, structured logs, latency/error metrics, tracing and correlation IDs.

## Rollout

Use preview environments, feature flags and staged percentages for risky changes. Define rollback before launch. Cache headers and service-worker behavior must not trap users on incompatible assets.

## Incident priorities

1. Unauthorized money/identity action.
2. Incorrect market resolution or order display.
3. Authentication outage.
4. Discovery degradation.
5. Cosmetic regression.
