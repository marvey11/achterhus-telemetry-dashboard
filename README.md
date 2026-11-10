# Achterhus Telemetry Dashboard

A React dashboard for service run telemetry provided by the Achterhus Telemetry
API. It presents per-service summaries, paginated run history, lifecycle status,
metrics, error details, and the event history for each run in a light theme.

## Architecture

The app is intentionally small and focused on a single dashboard flow:

- `src/App.tsx` owns the dashboard shell, time-range controls, service/status filters, and polling refresh behavior.
- `src/api.ts` centralizes request logic and the typed telemetry models used by the UI.
- `src/components/ServiceCard.tsx` renders the per-service overview cards.
- `src/components/RunsTable.tsx` renders the paginated run table using the shared `DataTable` from `@marvey11/codescape-ui` and includes row-expansion details for each run.
- `src/components/StatusBadge.tsx` and `src/components/statusPresentation.tsx` map service states to the dashboard's badge language and variant styling.
- `src/components/*` keep presentation logic local to the dashboard while reusing library primitives from the shared UI package.

## Requirements

- Node.js and npm
- The Achterhus Telemetry API, or a compatible API at `/api/v1/telemetry`

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

The API must expose the versioned endpoints for the service overview, runs, and run
events. Run history uses a page size of 50. The time range filters both the service
overview and runs to all time, the last 24 hours, the last 7 days, or the last month.
Changing the time range, service, or status filter returns to the first page; run
pagination is applied within the selected time range.

## Quality checks

```sh
npm run typecheck
npm run lint
npm run lint:md
npm run test:run
npm run build
```

## Configuration

`VITE_BASE_PATH` can be set at build time when the dashboard is hosted beneath a
URL subpath. `VITE_API_BASE_URL` sets the API origin; leave it unset to use the
dashboard's origin.

## Repository automation

The repository includes conventional-commit validation, Markdown linting, and git hooks:

- `pre-commit`: runs `lint-staged` for staged files
- `commit-msg`: runs `commitlint`
- `pre-push`: runs `npm run test:run`

GitHub Actions validate the same checks in CI, while the PR workflow excludes
`dependabot[bot]` from commitlint enforcement.
