<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 1.2.0 -> 1.3.0

Versioning Rationale: MINOR bump. Removed mandatory workflow steps (GitHub
issue creation and immediate branch publishing) from the Feature Development
Process. This materially simplifies the development workflow by removing
procedural requirements, but does not redefine core technical principles.

Modified Sections:
  - Feature Development Process → Removed steps 1 and 3
    (Removed mandatory GitHub issue creation step)
    (Removed mandatory immediate branch publishing step)
  - Naming Conventions → Removed branch naming pattern with issue numbers
    (Removed feature/#NNN-name, hotfix/#NNN-name, bugfix/#NNN-name patterns)
    (Branch naming can now follow simpler patterns without issue number requirement)

Removed Guidance:
  - Mandatory GitHub issue creation before starting work
  - Requirement to use gh CLI or GitHub web UI for issue creation
  - Mandatory immediate branch publishing after creation
  - Strict branch naming with issue numbers (feature/#42-user-auth pattern)
  - CI/pre-commit hook enforcement of branch naming convention

Retained Guidance:
  - All testing requirements (TDD, naming conventions, co-location)
  - Technology stack requirements
  - Feature architecture patterns
  - Code quality gates
  - All other naming conventions (components, stores, files)

Templates Requiring Updates:
  - spec-template.md: ✅ UPDATED - Feature Branch now uses feature/[kebab-case-name]
    pattern (removed issue number requirement)
  - plan-template.md: ✅ UPDATED - Branch references simplified to
    feature/[feature-name] and spec paths updated
  - tasks-template.md: ✅ UPDATED - Input path simplified to /specs/[feature-name]/
  - AGENTS.md: ✅ COMPATIBLE - no workflow step requirements

Deferred TODOs: None

Follow-up Actions: None - all templates updated
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
- Integration and unit tests MUST be created alongside main components

**Test File Naming Conventions** (MANDATORY):

| Test Type | Naming Pattern | Example |
|-----------|----------------|---------|
| Unit tests | `*.unit.test.ts(x)` | `UserCard.unit.test.tsx` |
| Integration tests | `*.integration.test.ts(x)` | `auth.integration.test.ts` |

**Test File Locations**:

- Tests MUST be co-located with source code (same directory as the component/module)
- Unit tests: `src/features/<feature>/components/ComponentName.unit.test.tsx`
- Integration tests: `src/features/<feature>/<feature-name>.integration.test.ts`

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

### Code Quality Gates

All PRs MUST pass before merge:

1. `bun run lint` - Biome with zero errors
2. `bun run build` - TypeScript compilation with zero errors
3. All tests passing (when test runner configured)

### Feature Development Process

1. Create feature branch with descriptive name (e.g., `feature/user-authentication`)
2. Scaffold feature structure using `bun run generate:feature`
3. Write tests FIRST (TDD) - unit tests (`*.unit.test.ts(x)`) and
   integration tests (`*.integration.test.ts(x)`)
4. Implement to pass tests
5. Run lint and build validation
6. Submit PR with clear description
7. Ensure all code quality gates pass before merge

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Feature folders | kebab-case | `user-profile/` |
| Components | PascalCase.tsx | `UserCard.tsx` |
| Pages | PascalCasePage.tsx | `ProfilePage.tsx` |
| Stores | use<Thing>Store.ts | `useAuthStore.ts` |
| Schemas | *.schema.ts | `login.schema.ts` |
| Hooks | use<Thing>.ts | `useDebounce.ts` |
| Unit tests | *.unit.test.ts(x) | `UserCard.unit.test.tsx` |
| Integration tests | *.integration.test.ts(x) | `auth.integration.test.ts` |
| Feature branches | feature/descriptive-name | `feature/user-auth` |
| Hotfix branches | hotfix/descriptive-name | `hotfix/login-crash` |
| Bugfix branches | bugfix/descriptive-name | `bugfix/form-validation` |

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

**Version**: 1.3.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-10
