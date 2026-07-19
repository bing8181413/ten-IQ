---
name: design-review
description: Review new UI against Foretell's visual DNA, usability, accessibility and anti-drift constraints.
---

# Design Review

Review in four passes:

1. **Hierarchy:** event question, probability and action are visible in that order.
2. **Consistency:** tokens, spacing, typography, card anatomy and interaction reuse existing patterns.
3. **States:** loading, empty, error, focus, disabled, mobile and long-content cases are designed.
4. **Trust:** resolution source, deadlines, risk language and money-like actions are not misleading.

Reject when the change introduces a one-off card, arbitrary color, oversized decoration, hidden critical metadata, color-only meaning, inaccessible target size, unclear order action or casino-like cue.

Use Storybook for isolated states and Playwright screenshots for page-level comparison. A visual snapshot change needs an explicit design reason in the active task.
