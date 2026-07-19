# API contract

Base URL comes from `VITE_API_BASE_URL`.

## GET /markets

Query: `category`, `sort=trending|volume|newest`, `search`.

Response:

```json
{ "data": [], "meta": { "total": 0, "updatedAt": "ISO-8601" } }
```

## GET /markets/:slug

Response:

```json
{ "data": { "id": "...", "slug": "...", "outcomes": [] } }
```

Schemas live in `src/types/market.ts`. Breaking changes require versioning, migration notes and compatibility review. Money values in a real API should use integer minor units or decimal strings, never binary floating point.
