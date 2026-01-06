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
- No test runner is configured yet (no `test` script).
- Validate changes with `bun run lint` and `bun run build`.
- If you add tests, place them near the code under test as `*.test.ts(x)` or `*.spec.ts(x)`.

## Commit & Pull Request Guidelines
- Follow Conventional Commits: `feat: …`, `fix: …`, `chore: …`, `refactor: …`, `style: …`.
- PRs should include a clear summary, linked issue (if any), screenshots for UI changes, and notes for any `.env` or config updates.

## Configuration & Secrets
- Copy `/.env.example` to `/.env` and set required `VITE_*` values (API URL + Firebase).
- Do not commit secrets; `.env*` files are ignored by Git.
