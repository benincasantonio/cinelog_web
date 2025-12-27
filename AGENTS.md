# Repository Guidelines

## Project Structure & Module Organization
- `src/` – React + TypeScript app code.
  - `src/routes/` – top-level routing (see `AppRoutes.tsx`).
  - `src/features/<feature>/` – feature modules (kebab-case folder names), typically split into `components/`, `pages/`, `store/` (or `stores/`), `repositories/`, `models/`, and `schemas/`.
  - `src/lib/` – shared infrastructure (Firebase, API client, layout/components, hooks, context).
- `public/` – static assets served as-is.
- `scripts/plop/` – Plop generators for consistent scaffolding.

## Build, Test, and Development Commands
- `npm install` (or `npm ci`) – install dependencies.
- `npm run dev` – start the Vite dev server.
- `npm run build` – TypeScript build (`tsc -b`) + production bundle.
- `npm run preview` – serve the production build locally.
- `npm run lint` – run ESLint (flat config in `eslint.config.js`).
- `npm run generate:feature` / `npm run generate:component` – scaffold code via Plop.

## Coding Style & Naming Conventions
- TypeScript + React function components; keep `strict` typing on.
- Prefer import aliases: `@/…` for `src/` and `@features/…` for `src/features/`.
- Naming conventions:
  - Components: `PascalCase.tsx` (e.g., `src/lib/components/Navbar.tsx`)
  - Pages: `PascalCasePage.tsx` (e.g., `src/features/profile/pages/ProfilePage.tsx`)
  - Stores: `use<Thing>Store.ts` (e.g., `src/features/auth/stores/useAuthStore.ts`)
  - Schemas: `*.schema.ts` (e.g., `src/features/auth/schemas/login.schema.ts`)
  - Feature folders: `kebab-case/` (e.g., `src/features/movie-search/`)
- Match the surrounding formatting in touched files and ensure `npm run lint` passes.

## Testing Guidelines
- No test runner is configured yet (no `test` script). Validate changes with `npm run lint` and `npm run build`.
- If you add tests, use `*.test.ts(x)` or `*.spec.ts(x)` close to the code under test.

## Commit & Pull Request Guidelines
- Follow Conventional Commits used in history: `feat: …`, `fix: …`, `chore: …`, `refactor: …`, `style: …`.
- PRs should include a clear summary, linked issue (if any), screenshots for UI changes, and notes for any `.env`/config updates.

## Configuration & Secrets
- Copy `/.env.example` to `/.env` and fill `VITE_*` values (API URL + Firebase).
- Do not commit secrets; `.env*` files are ignored by Git.
