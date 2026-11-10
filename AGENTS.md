# AGENTS.md

This repository is a Vite + React dashboard for Achterhus telemetry data. Its responsibilities are intentionally narrow: fetch service/run data from the telemetry API, render the current overview, and surface execution details without handling unrelated domain logic.

## Package responsibilities

- `src/App.tsx` owns dashboard layout, time-range filters, service/status filtering, and page state.
- `src/api.ts` defines API contracts and request helpers for overview data, run listings, and run-event history.
- `src/components/` contains presentational widgets such as service cards, status badges, and the paginated run table.
- `src/assets/` stores static assets bundled by Vite.
- `public/` contains static browser assets served directly.

## Conventions

- Prefer React Query for API-backed state and polling refresh logic.
- Keep status, formatting, and display mapping in shared utility/presentation modules instead of duplicating logic in multiple components.
- Preserve accessibility semantics such as labels, `aria-expanded`, and screen-reader-only text when a UI control is interactive.
- Treat the API as the source of truth for run metadata, and keep formatting functions narrow and deterministic.

## Validation commands

Run the project’s checks before finalizing changes:

```sh
npm run typecheck
npm run lint
npm run lint:md
npm run test:run
npm run build
```

## Quality gates

- `pre-commit`: runs `lint-staged` for staged files (`eslint --fix`, `prettier --write`, and `markdownlint-cli2`).
- `commit-msg`: runs `commitlint` and requires conventional-commit format.
- `pre-push`: runs `npm run test:run`.

## Notes for future agents

- Use the existing `VITE_API_BASE_URL` override for local API access when the dashboard is not served from the same origin as the API.
- Keep documentation updates accurate: project realities and command names should match the current scripts and workflows, not aspirational descriptions.
- Preserve the repository-specific markdownlint configuration in `.markdownlint.yaml` when editing markdown files.
