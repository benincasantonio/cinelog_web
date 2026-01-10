# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React + TypeScript app. Routing lives in `src/routes/` (see `AppRoutes.tsx`).
- Feature modules live in `src/features/<feature>/` using kebab-case, typically split into `components/`, `pages/`, `stores/` (or `store/`), `repositories/`, `models/`, and `schemas/`.
- Shared infrastructure and UI go in `src/lib/` (API client, Firebase, layout/components, hooks, context).
- Static assets live in `public/`. Plop generators are in `scripts/plop/`.

## Build, Test, and Development Commands
- `bun install` installs dependencies.
- `bun run dev` starts the Vite dev server.
- `bun run build` runs `tsc -b` and produces a production bundle.
- `bun run preview` serves the production build locally.
- `bun run lint` runs ESLint (flat config in `eslint.config.js`).

## Coding Style & Naming Conventions
- Use TypeScript + React function components with strict typing.
- Prefer import aliases: `@/…` for `src/` and `@features/…` for `src/features/`.
- Naming patterns:
  - Components: `PascalCase.tsx` (e.g., `src/lib/components/Navbar.tsx`)
  - Pages: `PascalCasePage.tsx` (e.g., `src/features/profile/pages/ProfilePage.tsx`)
  - Stores: `use<Thing>Store.ts` (e.g., `src/features/auth/stores/useAuthStore.ts`)
  - Schemas: `*.schema.ts` (e.g., `src/features/auth/schemas/login.schema.ts`)
  - Feature folders: `kebab-case/`

## Testing Guidelines

All features MUST follow Test-Driven Development (TDD) principles. Tests are executed with **Vitest v4.0.16+** and **Playwright v1.57+** for E2E testing.

### Running Tests Locally

- `bun run test` - Watch mode for all unit and integration tests
- `bun run test:unit` - Run only unit tests (`*.unit.test.ts(x)`)
- `bun run test:integration` - Run only integration tests (`*.integration.test.ts(x)`)
- `bun run test:ui` - Open Vitest UI dashboard for visual test exploration
- `bun run test:coverage` - Generate coverage report (output: `./coverage/`)

### Test File Organization

- **Unit tests**: `*.unit.test.ts(x)` - Test isolated components/functions
- **Integration tests**: `*.integration.test.ts(x)` - Test feature interactions
- **E2E tests**: Playwright tests in `tests/` directory
- **Location**: Tests MUST be co-located with source code
  - Example: `src/features/movie/components/MovieLogItem.unit.test.tsx`

### TDD Workflow

1. Write failing tests FIRST (Red phase)
2. Implement minimal code to pass (Green phase)
3. Refactor while keeping tests passing (Refactor phase)
4. Validate with `bun run lint && bun run build && bun run test:unit && bun run test:integration`

### Code Quality Gates

All PRs MUST pass:
- `bun run lint` - Zero ESLint errors
- `bun run build` - TypeScript compilation + test exclusion verification
- `bun run test:unit` - All unit tests passing
- `bun run test:integration` - All integration tests passing
- GitHub Actions CI/CD pipeline passing (unit/integration/E2E tests)

## Commit & Pull Request Guidelines
- Follow Conventional Commits: `feat: …`, `fix: …`, `chore: …`, `refactor: …`, `style: …`.
- PRs should include a clear summary, linked issue (if any), screenshots for UI changes, and notes for any `.env` or config updates.

## Configuration & Secrets
- Copy `/.env.example` to `/.env` and set required `VITE_*` values (API URL + Firebase).
- Do not commit secrets; `.env*` files are ignored by Git.
