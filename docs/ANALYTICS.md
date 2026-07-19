# Analytics

Events are typed in `src/lib/analytics.ts` and disabled by default.

Principles:

- Collect only data tied to a decision.
- Do not send wallet addresses, order details, signatures or free-form search text without explicit privacy review.
- Version event names and properties.
- Record owner, purpose, retention and deletion policy.
- Validate events in tests for revenue- or compliance-critical funnels.
