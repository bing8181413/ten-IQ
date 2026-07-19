---
name: quality-and-release
description: Apply automated quality gates, release evidence, rollback planning and honest completion reporting.
---

# Quality and Release

## Required commands

```bash
pnpm run quality
pnpm run build:storybook
pnpm run test:e2e
```

Browser-dependent checks may be marked environment-blocked only when the exact infrastructure error is recorded. Never convert a product failure into an environment exception.

## Release evidence

Record:

- commands and exit status
- user-visible changes
- changed contracts and configuration
- migration or compatibility impact
- analytics and alert changes
- known limitations
- rollout and rollback instructions
- final role decisions

Do not say “done” when a required command fails. Distinguish passed, failed, not run and environment-blocked.
