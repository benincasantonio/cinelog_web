# Repository Guidelines

## Project Structure & Module Organization
- `src/` contains the React + TypeScript app. Routing lives in `src/routes/` (see `AppRoutes.tsx`).
- Feature modules live in `src/features/<feature>/` using kebab-case, typically split into `components/`, `pages/`, `stores/` (or `store/`), `repositories/`, `models/`, and `schemas/`.
- Shared infrastructure and UI go in `src/lib/` (API client, layout/components, hooks, context).
- Static assets live in `public/`. Plop generators are in `scripts/plop/`.

## Build, Test, and Development Commands
- `bun install` installs dependencies.
- `bun run dev` starts the Vite dev server.
- `bun run build` runs `tsc -b` and produces a production bundle.
- `bun run preview` serves the production build locally.
- `bun run lint` runs Biome (linting + formatting check via `biome check`).\n- `bun run lint:fix` runs Biome with auto-fix.

## Coding Style & Naming Conventions
- Use TypeScript + React function components with strict typing.
- Prefer import aliases: `@/…` for `src/` and `@features/…` for `src/features/`.
- Naming patterns:
  - Components: `PascalCase.tsx` (e.g., `src/lib/components/Navbar.tsx`)
  - Pages: `PascalCasePage.tsx` (e.g., `src/features/profile/pages/ProfilePage.tsx`)
  - Stores: `use<Thing>Store.ts` (e.g., `src/features/auth/stores/useAuthStore.ts`)
  - Schemas: `*.schema.ts` (e.g., `src/features/auth/schemas/login.schema.ts`)
  - Feature folders: `kebab-case/`
- Zod validation schemas MUST be placed in `schemas/*.schema.ts` files within the feature module (e.g., `src/features/auth/schemas/login.schema.ts`), never inline in components. Export the schema, the inferred TypeScript type, and any related constants (e.g. `MIN_YEAR`).

## Testing Guidelines
- No test runner is configured yet (no `test` script).
- Validate changes with `bun run lint` and `bun run build`.
- TDD is MANDATORY: Write tests FIRST, verify they fail, then implement.
- Test naming conventions (per Constitution):
  - Unit tests: `*.unit.test.ts(x)` (e.g., `UserCard.unit.test.tsx`)
  - Integration tests: `*.integration.test.ts(x)` (e.g., `auth.integration.test.ts`)
- Tests MUST be co-located with source code (same directory as the component/module).

## Commit & Pull Request Guidelines
- Follow Conventional Commits: `feat: …`, `fix: …`, `chore: …`, `refactor: …`, `style: …`.
- PRs should include a clear summary, linked issue (if any), screenshots for UI changes, and notes for any `.env` or config updates.

## Configuration & Secrets
- Copy `/.env.example` to `/.env` and set required `VITE_*` values.
- Do not commit secrets; `.env*` files are ignored by Git.
