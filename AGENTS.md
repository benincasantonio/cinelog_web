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
- Prefer import alias `@/…` for `src/`.
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
- Keep test output low-noise:
  - Prefer non-watch runs in automation (`vitest run` / `bun run test:*`) and avoid interactive watch output.
  - Avoid React `act(...)` warnings in tests by wrapping async UI updates with Testing Library patterns (`fireEvent`/`userEvent` + `waitFor`).
  - Silence intentionally mocked `console.error`/`console.warn` with `mockImplementation(() => undefined)` and always restore spies.

## Development Flow

All work must be tied to a GitHub issue. Follow this workflow:

1. **A GitHub issue number must always be provided** before starting work. If none is given, ask for one.

2. **Create a branch from the issue** using the GitHub CLI:
   ```bash
   gh issue develop <issue-number> --checkout
   ```

3. **Check off acceptance criteria** on the GitHub issue as they are met, using the GitHub CLI:
   ```bash
   gh issue view <issue-number>
   gh issue edit <issue-number> --body "..."
   ```

4. **Write unit tests for all new code.** Every new function, method, or behavior must have corresponding unit tests.

5. **Do not commit changes autonomously.** Let the developer review changes step by step. Only commit when explicitly asked.

6. **Commit messages** must follow Conventional Commits format: `type(scope): description`
   - Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `ci`, `perf`, `style`
   - Scope: the module or area of change (e.g., `auth`, `profile`, `movie`, `ci`)
   - Example: `feat(profile): add user settings page with profile editing`

7. **Create a pull request** when the developer asks for it:
   ```bash
   gh pr create
   ```

## Commit & Pull Request Guidelines
- Follow Conventional Commits: `feat: …`, `fix: …`, `chore: …`, `refactor: …`, `style: …`.
- PRs should include a clear summary, linked issue (if any), screenshots for UI changes, and notes for any `.env` or config updates.

## API Error Handling
- API errors are mapped to form fields via `API_ERROR_MAP` in `src/lib/api/api-error.ts`. Each entry maps an API `error_code_name` to a form field and a generic i18n key under `ApiError.*` (e.g., `ApiError.samePassword`).
- Use `resolveApiFieldError(errorCodeName, t, overridePrefix?)` to resolve an error code to `{ field, message }`.
- **Override mechanism:** When an `overridePrefix` is provided (e.g., `'ChangePasswordForm'`), the helper first checks for `<prefix>.ApiError.<leafKey>` (e.g., `ChangePasswordForm.ApiError.samePassword`). If that i18n key exists, it is used; otherwise, it falls back to the generic `ApiError.*` key.
- To add a component-specific override, add the key under `<Component>.ApiError.<key>` in the locale files. If the generic message is sufficient, no override is needed.
- Example locale structure:
  ```json
  {
    "ApiError": {
      "samePassword": "Generic: passwords must differ"
    },
    "ChangePasswordForm": {
      "ApiError": {
        "samePassword": "Custom: new password must be different from current"
      }
    }
  }
  ```

## Configuration & Secrets
- Copy `/.env.example` to `/.env` and set required `VITE_*` values.
- Do not commit secrets; `.env*` files are ignored by Git.

## Programming Rules

Detailed conventions live in `docs/programming-rules/`:

- [Models](docs/programming-rules/models.md) — conventions for defining types, value enums, and barrel exports
