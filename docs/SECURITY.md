# Security and privacy

This starter does not perform real trades, custody funds or sign wallet messages.

## Before real-money integration

- Complete threat modeling and abuse cases.
- Separate authentication from transaction authorization.
- Use server-issued nonces, expiry and replay protection for signing.
- Enforce authorization server-side; never trust client roles.
- Protect secrets in managed secret storage.
- Define KYC/AML and jurisdiction policy with qualified counsel.
- Add audit logs, withdrawal/order limits, anomaly detection and incident runbooks.

## Frontend requirements

Validate external payloads, escape untrusted content, restrict external navigation, avoid sensitive local storage, use CSP and dependency scanning, and never log wallet signatures or personal data by default.

Report vulnerabilities privately through the repository security channel; do not open public issues containing exploit details.
