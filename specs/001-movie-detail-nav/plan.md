# Implementation Plan: Movie Title Navigation to Detail Page

**Feature Branch**: `001-movie-detail-nav`  
**Created**: 2026-01-09  
**Status**: Active  

## Overview

This feature enables users to navigate from the watched movies list directly to a movie detail page by clicking on the movie title. The implementation involves:

1. Making movie titles clickable in the `MovieLogItem` component
2. Implementing navigation using React Router with `tmdbId` as the identifier
3. Adding loading skeleton screens during data fetch
4. Handling error scenarios with fallback UI
5. Preserving watched list scroll position on back navigation

## Architecture & Design Decisions

### Component Changes

**Modified Components:**
- `MovieLogItem.tsx` - Add click handler to movie title to navigate to detail page
- No changes needed to `MovieLogList.tsx` or `MoviesWatched.tsx` (they don't need to change)

**Existing Components Used:**
- `MovieDetailsPage.tsx` - Already configured to accept `:tmdbId` route parameter
- `MovieDetailsHero.tsx` - Displays skeleton screens on load
- Routing in `AppRoutes.tsx` - Already has route `/movies/:tmdbId` configured

### Navigation Implementation

- Use React Router's `useNavigate()` hook with route path `/movies/${tmdbId}`
- Route parameter is already set up in `AppRoutes.tsx`: `path="/movies/:tmdbId"`
- Extract `tmdbId` from `log.movie?.tmdbId` 
- Use `navigate()` for client-side navigation (no full page reload)

### Loading & Error Handling

**Loading States:**
- Detail page already shows loading indicator (text message + skeleton screens via `MovieDetailsHero` component)
- No additional skeleton screen work needed for this feature

**Error Handling:**
- `MovieDetailsPage` already handles missing data (line 65-78):
  - Displays error message when `movieDetails` is null
  - Provides "Back" button using `navigate(-1)`
  - Uses translations for localized messages
- No changes needed to error handling

**List State Preservation:**
- Browser's native back button (`navigate(-1)`) handles this automatically
- React Router maintains scroll position in history state when using client-side navigation
- No additional work required

### Testing Strategy

**Unit Tests** (.unit.ts):
- Test click handler calls navigate with correct `tmdbId`
- Test that navigation uses correct route format
- Test with missing tmdbId (null/undefined handling)
- Test component renders title as clickable element

**Integration Tests** (.integration.ts):
- Test complete navigation flow: click title → navigate to detail page → data loads
- Test error scenario: click title → data fails to load → error message shown → back button works
- Test scroll position preservation during navigation
- Test with React Router setup

## Technical Specifications

### Implementation Details

**File: `MovieLogItem.tsx`**
- Add `useNavigate()` hook from react-router-dom
- Wrap movie title in clickable element (already has cursor-pointer class)
- Add onClick handler: `onClick={() => navigate(`/movies/${log.movie?.tmdbId}`)}`
- Add aria-label for accessibility
- Add role="button" or convert to button element

**Route Parameter Usage:**
- Existing route: `/movies/:tmdbId` → matches `/movies/550` (Fight Club tmdbId)
- MovieDetailsPage already extracts via `useParams<{ tmdbId: string }>()`
- No changes needed to routing

**Data Access:**
- `LogListItem` type must have `movie.tmdbId` property
- Verify in `@/features/logs/models` that `tmdbId` is available

### Dependencies

Required:
- `react-router-dom` (already installed)
- `react` (already installed)

Testing:
- `vitest` (needs setup)
- `@testing-library/react` (for DOM testing)
- `@testing-library/user-event` (for user interactions)
- `@testing-library/jest-dom` (for assertion matchers)

## Testing Configuration

### Vitest Setup

**Configuration File: `vitest.config.ts`** (create at root)
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['**/*.{unit,integration}.{ts,tsx}', '**/node_modules/**']
    }
  }
})
```

**Update `package.json` scripts:**
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

**Install Dependencies:**
```bash
bun install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Test File Structure

Place test files alongside component:
- `MovieLogItem.tsx` → `MovieLogItem.unit.ts` (unit tests)
- `MovieLogItem.tsx` → `MovieLogItem.integration.ts` (integration tests)

**Unit Test Focus** (.unit.ts):
- Component rendering (click handler present, title is clickable)
- Navigation function calls with correct parameters
- Props and state management
- Mock external dependencies

**Integration Test Focus** (.integration.ts):
- Real routing behavior
- Navigation to detail page
- Data loading flow
- Error scenarios
- User interactions with real context

### Test Utilities Setup

Create `src/test/setup.ts`:
```typescript
import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock common services if needed
vi.mock('@/features/logs/repositories')
```

## Task Breakdown

### Phase 1: Vitest Configuration
- [ ] Create `vitest.config.ts` at project root
- [ ] Update `package.json` with test scripts
- [ ] Install test dependencies: vitest, @testing-library/react, jsdom
- [ ] Create `src/test/setup.ts` for test configuration

### Phase 2: Implement Movie Title Navigation
- [ ] Add `useNavigate()` hook to `MovieLogItem.tsx`
- [ ] Implement click handler on movie title
- [ ] Add accessibility attributes (aria-label, role)
- [ ] Verify route matches existing `/movies/:tmdbId` pattern
- [ ] Test navigation manually in dev server

### Phase 3: Unit Tests for MovieLogItem
- [ ] Create `MovieLogItem.unit.ts`
- [ ] Test component renders without errors
- [ ] Test title element is clickable
- [ ] Test click handler calls navigate with correct route
- [ ] Test handles missing `tmdbId` gracefully
- [ ] Test with various movie data

### Phase 4: Integration Tests for Navigation Flow
- [ ] Create `MovieLogItem.integration.ts`
- [ ] Test click navigation with React Router setup
- [ ] Test navigation to detail page with tmdbId parameter
- [ ] Test error handling when detail page fails to load
- [ ] Test back button returns to watched list
- [ ] Test scroll position preservation

### Phase 5: Validation & Polish
- [ ] Run full test suite: `bun run test`
- [ ] Generate coverage report: `bun run test:coverage`
- [ ] Verify all tests pass
- [ ] Check Biome compliance: `bun run lint`
- [ ] Manual QA in dev server
- [ ] Update any affected documentation

## Success Criteria Verification

| Criterion | Verification Method | Status |
|-----------|-------------------|--------|
| Users navigate via movie title click | Integration test + manual testing | Pending |
| Navigation completes in <1 second | Manual performance check | Pending |
| 100% of titles are navigable | Unit test coverage | Pending |
| Correct movie displayed on first click | Integration test assertion | Pending |
| Back button preserves scroll position | Manual test + browser native behavior | Pending |
| Error handling with generic message | Integration test error scenario | Pending |
| Skeleton screen shows during load | Manual testing (already exists) | Pending |

## Key Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Missing `tmdbId` in log data | Navigation fails silently | Add null check before navigate, show error |
| Router not configured properly | Navigation doesn't work | Verify `/movies/:tmdbId` route exists |
| Type errors in LogListItem | TypeScript compilation fails | Check LogListItem definition for tmdbId field |
| Test environment issues | Tests won't run | Proper jsdom setup in vitest.config.ts |

## Assumptions

- `LogListItem` type includes `movie?.tmdbId` property
- MovieDetailsPage can handle receiving tmdbId as route parameter
- React Router history state management works automatically
- Test environment can run with jsdom
- No authentication or permission changes needed for navigation

## Next Steps

1. Run `/speckit.tasks` to generate detailed task list
2. Begin Phase 1: Vitest configuration setup
3. Proceed sequentially through phases
4. Run full test suite after each phase
5. Merge feature branch when all phases complete and tests pass
