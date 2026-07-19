# Agent workflow

Every non-trivial feature creates a task folder using `pnpm run agent:new -- "name"`.

## Gate 0: intake

Capture the user problem, evidence, scope, assumptions, measurable success, dependencies and risk classification.

## Gate 1: product dialogue

PM, UX and growth/business review independently. The Agent records disagreements instead of inventing consensus.

## Gate 2: engineering dialogue

Frontend, API, security/privacy and SRE review contracts, failure modes, access boundaries and rollback. A rejection blocks implementation.

## Gate 3: implementation plan

Map existing components, state, API schemas, files, tests, analytics and deployment. Implement in small verifiable slices.

## Gate 4: adversarial validation

QA, accessibility, performance and a skeptical user attempt to break the feature. Evidence goes into `qa.md`.

## Gate 5: release

Run quality checks, document change and rollback, then set `release.md` to `Decision: APPROVED`. Close with `pnpm run agent:close`.

## Multi-turn continuity

Task files are the source of truth across conversations. At the beginning of a new turn, the Agent reads them and resumes from the current gate. Chat memory is not accepted as the only record for decisions.
