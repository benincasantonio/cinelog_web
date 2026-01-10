<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 1.1.0 -> 1.2.0

Versioning Rationale: MINOR bump. Added new mandatory workflow step (publish
branch immediately after creation) and significantly expanded testing guidance
(TDD enforcement, specific naming patterns for unit and integration tests,
co-location requirements). These are material additions to existing principles.

Modified Sections:
  - Development Workflow → Feature Development Process
    (Added step 3: Publish branch immediately after creation)
  - Test-First Development (NON-NEGOTIABLE) → Expanded with naming conventions
    (Added unit test and integration test naming patterns)

Added Guidance:
  - Mandatory branch publishing immediately after creation for issue linking
  - Unit test naming pattern: *.unit.test.ts(x)
  - Integration test naming pattern: *.integration.test.ts(x)
  - Tests MUST be created alongside main components (co-location enforced)

Removed Sections: None

Templates Requiring Updates:
  - spec-template.md: ✅ COMPATIBLE - no changes needed
  - plan-template.md: ✅ COMPATIBLE - no changes needed  
  - tasks-template.md: ✅ UPDATED - test task examples now use new naming
    patterns (*.unit.test.ts, *.integration.test.ts)
  - AGENTS.md: ✅ UPDATED - Testing Guidelines section now includes new
    naming conventions and TDD requirement

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

3. **Publish Branch Immediately** (MANDATORY)
   - Use: `git push -u origin <branch-name>`
   - Branch MUST be published immediately after creation
   - This enables automatic linking to the GitHub issue
   - Do NOT proceed with development on an unpublished branch

4. Scaffold feature structure using `bun run generate:feature`
5. Write tests FIRST (TDD) - unit tests (`*.unit.test.ts(x)`) and
   integration tests (`*.integration.test.ts(x)`)
6. Implement to pass tests
7. Run lint and build validation
8. Submit PR with clear description and issue reference: "Closes #42"
9. Ensure all code quality gates pass before merge

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

**Version**: 1.2.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-10
