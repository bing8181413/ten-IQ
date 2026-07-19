---
name: feature-delivery-workflow
description: Execute every non-trivial feature through evidence, multi-role review, implementation, adversarial QA and release gates.
---

# Feature Delivery Workflow

## Start

Run `pnpm run agent:new -- "feature name"`. Use the generated task folder as the persistent multi-turn memory for the task.

## Gate sequence

1. **Intake:** user problem, evidence, assumptions, scope, success metric, risk class.
2. **Product review:** PM, UX and growth/business independently decide.
3. **Engineering review:** frontend, API, security/privacy and SRE independently decide.
4. **Plan:** component reuse, contracts, state, files, tests, rollout and rollback.
5. **Implementation:** smallest coherent slices; update tests with each slice.
6. **Adversarial QA:** QA, accessibility, performance and skeptical-user reviews.
7. **Release:** quality commands, documentation, telemetry, rollback and final approval.

## Multi-turn behavior

At the start of each new Agent turn:

- locate the active task folder
- read all task artifacts
- identify the current gate and unresolved decisions
- continue from evidence rather than restating from memory
- write decisions back before ending the turn

Do not simulate consensus. Roles may disagree. Record the conflict, choose a resolution owner and block implementation when the disagreement affects user safety, money, privacy, contract compatibility or destructive behavior.

## Small task exception

A one-file wording fix or mechanical refactor may skip task generation only when it changes no behavior, data contract, accessibility, analytics, security or visual pattern. It still runs relevant quality checks.
