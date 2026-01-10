# Cinelog Web

Cinelog Web is the React + TypeScript client for Cinelog, built with Vite (rolldown-vite) and Tailwind CSS.

## Getting Started

1. Install dependencies: `bun install`
2. Create environment config: `cp .env.example .env`
3. Fill in `VITE_*` values (API + Firebase).
4. Start the dev server: `bun run dev`

## Scripts

- `bun run dev` starts the Vite dev server.
- `bun run build` runs `tsc -b` and builds the production bundle.
- `bun run preview` serves the production build locally.
- `bun run lint` runs ESLint.
- `bun run generate:feature` scaffolds a new feature module.
- `bun run generate:component` scaffolds a new component.
- `bun run test` runs all tests in watch mode.
- `bun run test:unit` runs only unit tests.
- `bun run test:integration` runs only integration tests.
- `bun run test:ui` opens Vitest UI dashboard.
- `bun run test:coverage` generates test coverage report.

## Project Structure

- `src/routes/` contains top-level routing (`AppRoutes.tsx`).
- `src/features/<feature>/` holds feature modules (kebab-case).
- `src/lib/` contains shared infrastructure and UI.
- `public/` contains static assets.
- `scripts/plop/` contains generators.

## Environment Variables

Use `.env` with the following keys:

- `VITE_API_URL`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

## Testing

This project follows strict Test-Driven Development (TDD) practices.

**Test Framework**:
- Unit & Integration tests: Vitest v4.0.16+ with jsdom environment
- E2E tests: Playwright v1.57+

**Test File Naming**:
- Unit tests: `*.unit.test.ts(x)` - Isolated component/function tests
- Integration tests: `*.integration.test.ts(x)` - Feature interaction tests
- E2E tests: Playwright tests in `tests/` directory

**Running Tests**:
- `bun run test` - Watch mode for all tests
- `bun run test:unit` - Unit tests only
- `bun run test:integration` - Integration tests only
- `bun run test:ui` - Vitest UI dashboard
- `bun run test:coverage` - Coverage report

**Code Quality Requirements**:
Before submitting a PR, ensure all of these pass:
- `bun run lint` - ESLint validation
- `bun run build` - TypeScript compilation + test exclusion check
- `bun run test:unit` - All unit tests passing
- `bun run test:integration` - All integration tests passing

For detailed testing guidelines, see the [Constitution](/.specify/memory/constitution.md#iii-test-first-development-non-negotiable) and [AGENTS.md](/AGENTS.md#testing-guidelines).
