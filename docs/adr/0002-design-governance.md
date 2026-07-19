# ADR 0002: Design governance

Status: Accepted

## Decision

Visual consistency is enforced by semantic CSS tokens, component contracts, Storybook, a static design-check script, visual regression and mandatory Agent review gates.

## Rationale

A prose prompt alone cannot prevent long-term visual drift. Multiple independent controls make deviations visible before release.

## Consequences

New cross-cutting patterns require an ADR. Approved visual changes may update snapshots; unreviewed drift must be reverted.
