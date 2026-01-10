<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 1.0.0 -> 1.1.0

Versioning Rationale: MINOR bump. Added new mandatory workflow steps
(GitHub issue creation + strict branch naming) that expand existing
"Feature Development Process" guidance. No principles removed or redefined.

Modified Sections:
  - Development Workflow → Feature Development Process
    (Expanded from 6 to 8 steps, reordered with GitHub issue first)

Added Guidance:
  - Mandatory GitHub issue creation (gh CLI + manual fallback)
  - Strict branch naming: feature/#<issue>-<kebab-case>
  - CI/pre-commit hook enforcement requirement

Removed Sections: None

Templates Requiring Updates:
  - spec-template.md: ✅ UPDATED - Feature Branch reference added
  - plan-template.md: ✅ COMPATIBLE - no changes needed
  - tasks-template.md: ✅ COMPATIBLE - no changes needed

Deferred TODOs: None

Follow-up Actions:
  - CI/pre-commit hook setup (recommend using husky + branch-name-validator)
    This is noted but NOT in constitution scope—separate DevOps task
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

**Test File Locations**:

- Tests MUST be co-located with source code as `*.test.ts(x)` or `*.spec.ts(x)`
- Integration tests for features go in `src/features/<feature>/*.test.tsx`

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

1. `bun run lint` - ESLint with zero errors
2. `bun run build` - TypeScript compilation with zero errors
3. All tests passing (when test runner configured)

### Feature Development Process

1. **Create GitHub Issue** (MANDATORY)
   - Use: `gh issue create --title "[FEATURE_NAME]" --body "[DESCRIPTION]"`
   - Capture and record the issue number (e.g., #42)
   - **If `gh` CLI unavailable**: Create issue manually via GitHub web UI
   - Do NOT proceed without a documented GitHub issue

2. **Create Feature Branch** (STRICT NAMING CONVENTION)
   - Pattern: `feature/#<issue-number>-<kebab-case-name>`
   - Example: `feature/#42-user-authentication`
   - Other workflows:
     - Hotfix: `hotfix/#123-login-bug`
     - Bug fix: `bugfix/#456-form-validation`
   - **STRICT ENFORCEMENT**: Branch names MUST match pattern; CI/pre-commit
     hooks block merge if naming convention is violated

3. Scaffold feature structure using `bun run generate:feature`
4. Write tests FIRST (TDD)
5. Implement to pass tests
6. Run lint and build validation
7. Submit PR with clear description and issue reference: "Closes #42"
8. Ensure all code quality gates pass before merge

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Feature folders | kebab-case | `user-profile/` |
| Components | PascalCase.tsx | `UserCard.tsx` |
| Pages | PascalCasePage.tsx | `ProfilePage.tsx` |
| Stores | use<Thing>Store.ts | `useAuthStore.ts` |
| Schemas | *.schema.ts | `login.schema.ts` |
| Hooks | use<Thing>.ts | `useDebounce.ts` |
| Feature branches | feature/#NNN-name | `feature/#42-user-auth` |
| Hotfix branches | hotfix/#NNN-name | `hotfix/#123-crash-fix` |
| Bugfix branches | bugfix/#NNN-name | `bugfix/#456-validation` |

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
