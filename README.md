# Achterhus Telemetry Dashboard

A React dashboard for service run telemetry provided by the Achterhus Telemetry
API. It presents per-service summaries, paginated run history, lifecycle status,
metrics, error details and the event history for each run. The interface is
designed for a light theme.

## Requirements

- Node.js and npm
- The Achterhus Telemetry API, or a compatible API at `/api/v1`

## Local development

```sh
npm ci
npm run dev
```

By default, API requests use the same origin as the dashboard. To use a separate
API host, set `VITE_API_BASE_URL` in a local `.env` file:

```dotenv
VITE_API_BASE_URL=http://localhost:8000
```

The API must expose the versioned endpoints for the service overview, runs and run
events. Run history uses a page size of 50; changing service or status filters
returns to the first page.

## Checks

```sh
npm run typecheck
npm run lint
npm run test:run
npm run build
```

## Configuration

`VITE_BASE_PATH` can be set at build time when the dashboard is hosted beneath a
URL subpath. `VITE_API_BASE_URL` sets the API origin; leave it unset to use the
dashboard's origin.
