<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 1.0.0 -> 1.1.0 (Vitest testing framework integration)

Modified Principles:
  - III. Test-First Development: Expanded with Vitest-specific practices and CI/CD

Added Sections:
  - Test Infrastructure (new subsection under Development Workflow)
  - Test File Naming & Organization
  - Build Configuration & Test Exclusion
  - CI/CD Testing Pipeline

Removed Sections: None

Templates Requiring Updates:
  - .specify/templates/plan-template.md: ✅ Compatible (no changes needed)
  - .specify/templates/spec-template.md: ✅ Compatible (no changes needed)
  - .specify/templates/tasks-template.md: ✅ Compatible (no changes needed)
  - AGENTS.md: ⚠ Pending manual update (Testing Guidelines section outdated)
  - README.md: ⚠ Pending manual update (Testing section references removed)

Deferred TODOs: None

Follow-up Actions:
  - Update AGENTS.md Testing Guidelines section (line 26-29)
  - Update README.md Testing section (line 42-44) to reference vitest commands
  - Consider documenting playwright.yml workflow_run dependency pattern
================================================================================
-->

# Cinelog Web Constitution

## Core Principles

### I. Technology Stack

The project MUST use the following core technologies:

- **Runtime**: Bun
- **Framework**: React 19 with TypeScript (strict mode)
- **State Management**: Zustand for all client-side state
- **Build Tool**: Vite (rolldown-vite)

All code MUST follow React 19 best practices including Server Components and Actions
where applicable. TypeScript strict mode is mandatory with no `any` types permitted
except when interfacing with untyped third-party libraries (must be documented).

### II. Feature Architecture (Feature Sliced Modified)

All business logic MUST reside in `src/features/`.

**Feature Folder Anatomy** - Every feature folder MUST contain these subfolders:

- `components/` - React components specific to the feature
- `store/` - Zustand stores for feature state
- `utilities/` - Helper functions and utilities
- `hooks/` - Custom React hooks for the feature

Additional optional subfolders (when needed):

- `pages/` - Page components for routing
- `repositories/` - Data access layer
- `models/` - TypeScript interfaces and types
- `schemas/` - Zod validation schemas

**Shared Code** - All reusable components, global stores, and helpers MUST be placed
in `src/lib/` (NOT `shared/`). This includes:

- `src/lib/components/` - Shared UI components
- `src/lib/hooks/` - Shared custom hooks
- `src/lib/context/` - React context providers
- `src/lib/api/` - API client infrastructure

### III. Test-First Development (NON-NEGOTIABLE)

Strict Test-Driven Development is MANDATORY for all feature implementations.

**TDD Cycle**:

1. Write failing Unit, Integration, and E2E tests FIRST
2. Verify tests fail (Red phase)
3. Implement minimal code to pass tests (Green phase)
4. Refactor while keeping tests passing (Refactor phase)

**Test Coverage Requirements**:

- All success paths MUST have test coverage
- All edge cases MUST have test coverage
- No implementation code may be written before corresponding tests exist

**Test Framework & Tools**:

- Unit & Integration tests: **Vitest** (v4.0.16+) with jsdom environment
- E2E tests: **Playwright** (v1.57+)
- Testing utilities: @testing-library/react, @testing-library/user-event
- Test assertions: expect with testing-library matchers (@testing-library/jest-dom)

**Test File Naming Convention**:

- Unit tests: `*.unit.test.ts(x)` - Test isolated components/functions
- Integration tests: `*.integration.test.ts(x)` - Test feature interactions
- E2E tests: Playwright test files (separate from source code)

**Test File Locations**:

- Unit and integration tests MUST be co-located with source code
- Pattern: `src/features/<feature>/<type>/<name>.{unit,integration}.test.ts(x)`
- Example: `src/features/movie/components/MovieLogItem.unit.test.tsx`

## Technology Stack Requirements

### Mandatory Dependencies

| Category | Technology | Version Constraint |
|----------|------------|-------------------|
| Runtime | Bun | Latest stable |
| Framework | React | ^19.x |
| Language | TypeScript | ~5.9.x (strict) |
| State | Zustand | ^5.x |
| Routing | react-router-dom | ^7.x |
| Forms | react-hook-form + zod | Latest |
| Styling | Tailwind CSS | ^4.x |

### Prohibited Patterns

- Redux or other state management libraries (use Zustand)
- Class components (use function components only)
- `any` types without documented justification
- Direct DOM manipulation outside React lifecycle
- CSS-in-JS libraries (use Tailwind CSS)

## Development Workflow

### Test Infrastructure

**Running Tests Locally**:

| Command | Purpose | Scope |
|---------|---------|-------|
| `bun run test` | Watch mode for all tests | All unit + integration tests |
| `bun run test:unit` | Run unit tests only | `*.unit.test.ts(x)` files |
| `bun run test:integration` | Run integration tests only | `*.integration.test.ts(x)` files |
| `bun run test:ui` | Vitest UI dashboard | Visual test explorer |
| `bun run test:coverage` | Generate coverage report | Coverage metrics in `./coverage/` |

**Build Configuration**:

- `bun run build` automatically excludes test files from TypeScript compilation
- Test files are filtered via `tsconfig.app.json` exclude patterns
- No test files MUST appear in production bundle (dist/)

**Test Environment Setup**:

- Vitest configured with jsdom environment for DOM testing
- Setup file: `src/test/setup.ts` initializes:
  - @testing-library/jest-dom matchers
  - Browser API mocks (matchMedia)
  - Global cleanup after each test

### Code Quality Gates

All PRs MUST pass before merge:

1. `bun run lint` - ESLint with zero errors
2. `bun run build` - TypeScript compilation + test exclusion verification
3. `bun run test:unit` - All unit tests passing
4. `bun run test:integration` - All integration tests passing
5. Playwright E2E tests passing (via `.github/workflows/playwright.yml`)
6. Minimum code coverage maintained (verify via `bun run test:coverage`)

**CI/CD Testing Pipeline**:

- Unit & Integration tests run on every push and PR (`.github/workflows/tests.yml`)
- Playwright E2E tests trigger only after unit + integration tests pass
- Coverage reports uploaded to Codecov (separate flags for unit/integration)
- Test results block merge if any tests fail

### Feature Development Process

1. Create feature branch from `main` (use `feature/<issue>-<description>`)
2. Create GitHub issue (use `gh issue create`) before starting work
3. Scaffold feature structure using `bun run generate:feature`
4. **Write tests FIRST** following TDD:
   - Write unit tests for business logic
   - Write integration tests for component interactions
   - Verify tests fail (Red)
5. Implement minimal code to pass tests (Green)
6. Refactor while maintaining test coverage (Refactor)
7. Run full validation suite:
   - `bun run lint` - Fix any linting errors
   - `bun run build` - Verify TypeScript compilation and test exclusion
   - `bun run test:unit && bun run test:integration` - Ensure all tests pass
8. Submit PR with reference to GitHub issue (#<number>)
9. Obtain code review approval before merge

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Feature folders | kebab-case | `user-profile/` |
| Components | PascalCase.tsx | `UserCard.tsx` |
| Pages | PascalCasePage.tsx | `ProfilePage.tsx` |
| Stores | use<Thing>Store.ts | `useAuthStore.ts` |
| Schemas | *.schema.ts | `login.schema.ts` |
| Hooks | use<Thing>.ts | `useDebounce.ts` |

## Governance

This Constitution supersedes all other development practices and conventions.
All code reviews MUST verify compliance with these principles.

**Amendment Process**:

1. Propose changes via PR to this file
2. Document rationale for changes
3. Obtain team review and approval
4. Update version number according to semantic versioning
5. Update `LAST_AMENDED_DATE`

**Versioning Policy**:

- MAJOR: Backward incompatible principle removals or redefinitions
- MINOR: New principles or materially expanded guidance
- PATCH: Clarifications, wording improvements, typo fixes

**Compliance Review**:

- All PRs must include Constitution compliance check
- Violations require documented justification and approval
- Recurring violations trigger process review

For runtime development guidance, refer to `AGENTS.md` at repository root.

**Version**: 1.1.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-10
