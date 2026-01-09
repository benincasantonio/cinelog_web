# Implementation Tasks: Movie Title Navigation to Detail Page

**Feature Branch**: `001-movie-detail-nav`  
**Feature Spec**: `specs/001-movie-detail-nav/spec.md`  
**Plan**: `specs/001-movie-detail-nav/plan.md`  

## Task Summary

Total Tasks: 15  
Phases: 5 (Vitest Setup → Implementation → Unit Tests → Integration Tests → Validation)

---

## Phase 1: Vitest Configuration Setup (4 tasks)

### TASK 1.1: Create vitest.config.ts Configuration File
**Priority**: P0 (Blocking)  
**Type**: Configuration  
**Effort**: 30 minutes

**Acceptance Criteria**:
- [x] File `vitest.config.ts` created at project root
- [x] Configuration includes React plugin setup
- [x] Path aliases (@/, @features/) configured to match tsconfig
- [x] jsdom environment configured for React component testing
- [x] Coverage provider set to v8
- [x] Include/exclude patterns set for source files
- [x] File can be validated with `vitest --config vitest.config.ts --help`

**Implementation Notes**:
- Copy vitest config from Context7 documentation
- Ensure React plugin (@vitejs/plugin-react) is already installed
- Match path aliases with existing tsconfig.json
- Set exclude to skip test files from coverage

**Testing**: None (config validation only)

---

### TASK 1.2: Install Test Dependencies
**Priority**: P0 (Blocking)  
**Type**: Setup  
**Effort**: 10 minutes

**Dependencies to Install**:
```bash
bun install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/ui
```

**Acceptance Criteria**:
- [x] All packages installed successfully
- [x] `bun.lock` updated
- [x] No peer dependency warnings
- [x] Verify installations: `bun run -e "import('vitest')"` succeeds
- [x] @testing-library/react version is compatible with React 19.x

**Implementation Notes**:
- Use bun package manager (already in use)
- Install as devDependencies (-D flag)
- @vitest/ui is optional but useful for test UI

**Testing**: Verify imports work in new test file

---

### TASK 1.3: Update package.json Test Scripts
**Priority**: P0 (Blocking)  
**Type**: Configuration  
**Effort**: 5 minutes

**Acceptance Criteria**:
- [x] `package.json` has new scripts section or updated existing one
- [x] Script `test`: `vitest` (watch mode)
- [x] Script `test:run`: `vitest run` (single run)
- [x] Script `test:ui`: `vitest --ui` (optional)
- [x] Script `test:coverage`: `vitest --coverage` (optional)
- [x] Scripts are formatted as JSON
- [x] Verify scripts work: `bun run test --help`

**Implementation Notes**:
- Add scripts to existing `scripts` object in package.json
- Keep existing scripts (dev, build, lint, etc.)
- Watch mode (default vitest) is useful for development

**Testing**: Run `bun run test --version` to verify vitest CLI works

---

### TASK 1.4: Create Test Setup File (src/test/setup.ts)
**Priority**: P1 (High)  
**Type**: Setup  
**Effort**: 15 minutes

**Acceptance Criteria**:
- [x] File `src/test/setup.ts` created
- [x] Imports @testing-library/jest-dom
- [x] Configures afterEach cleanup for React components
- [x] Can be referenced in vitest.config.ts
- [x] TypeScript compiles without errors
- [x] Setup file runs before any tests

**Implementation Notes**:
- Setup file ensures cleanup between tests to prevent memory leaks
- Extends vitest with common testing library matchers
- Can add global mocks here if needed

**Testing**: None (setup validation in later test phases)

**Related**: TASK 1.1 (must update vitest.config.ts to reference this file)

---

## Phase 2: Implement Movie Title Navigation (3 tasks)

### TASK 2.1: Modify MovieLogItem Component for Navigation
**Priority**: P0 (Blocking)  
**Type**: Feature Implementation  
**Effort**: 30 minutes  
**File**: `src/features/movie/components/MovieLogItem.tsx`

**Changes Required**:
- [x] Add import: `import { useNavigate } from "react-router-dom"`
- [x] Add hook: `const navigate = useNavigate()` in component
- [x] Extract tmdbId from log: Use `log.tmdbId` (available directly on LogListItem type)
- [x] Add click handler to movie title div:
  ```typescript
  onClick={() => {
    if (log.tmdbId) {
      navigate(`/movies/${log.tmdbId}`);
    }
  }}
  ```
- [x] Add accessibility: `role="button"` and `aria-label` (e.g., `aria-label={`View ${log.movie?.title || 'movie'} details`}`)
- [x] Convert cursor-pointer class to data-testid for testing: `data-testid="movie-title-link"`

**Acceptance Criteria**:
- [x] MovieLogItem compiles without TypeScript errors
- [x] Component still renders all existing content (title, date, ratings)
- [x] Title element has `role="button"` and `aria-label`
- [x] Title element has click handler
- [x] Click handler uses `log.tmdbId` (not log.movie?.tmdbId)
- [x] Navigation only occurs if tmdbId is defined
- [x] ESLint passes: `bun run lint src/features/movie/components/MovieLogItem.tsx`
- [x] Component builds successfully: `bun run build`

**Implementation Notes**:
- `log.tmdbId` is a required field on LogListItem (line 6 of log-list-item.ts)
- The route `/movies/:tmdbId` already exists in AppRoutes.tsx
- MovieDetailsPage expects `useParams<{ tmdbId: string }>()` - route will convert number to string automatically
- Existing title structure is in a div with flex layout - add click handler there

**Testing**: TASK 3.1 (Unit Test)

---

### TASK 2.2: Verify Routing Configuration
**Priority**: P1 (High)  
**Type**: Verification  
**Effort**: 10 minutes

**Acceptance Criteria**:
- [x] Confirm route exists in AppRoutes.tsx: `path="/movies/:tmdbId"`
- [x] Confirm route points to: `<MovieDetailsPage />`
- [x] Confirm route id is: `"movie-details"` (or document actual id)
- [x] Route is properly nested in route tree
- [x] No conflicting routes that might match `/movies/[number]`
- [x] Documentation updated if route structure needed clarification

**Implementation Notes**:
- Route should already exist - this is verification only
- MovieDetailsPage uses `useParams<{ tmdbId: string }>()` to extract parameter
- React Router converts `:tmdbId` param to string automatically

**Related**: TASK 2.1 (navigation target)

---

### TASK 2.3: Manual Testing in Dev Server
**Priority**: P1 (High)  
**Type**: Manual QA  
**Effort**: 15 minutes

**Prerequisites**:
- TASK 2.1 completed
- TASK 2.2 verified

**Test Steps**:
- [ ] Start dev server: `bun run dev`
- [ ] Navigate to Profile → Movies Watched (or path containing MoviesWatched)
- [ ] Click on a movie title in the watched list
- [ ] Verify navigation to detail page with correct tmdbId in URL
- [ ] Verify movie details load for the selected movie
- [ ] Verify skeleton/loading states appear briefly during load
- [ ] Click browser back button
- [ ] Verify return to watched list with scroll position preserved (approximate)
- [ ] Repeat with multiple movies to ensure consistent behavior

**Acceptance Criteria**:
- [ ] Navigation works without errors
- [ ] URL matches pattern `/movies/[tmdbId]` where tmdbId is a number
- [ ] Detail page displays correct movie information
- [ ] No console errors or warnings
- [ ] Back button returns to previous page
- [ ] User can repeat navigation multiple times

**Notes**: This is a sanity check before automated tests

---

## Phase 3: Unit Tests for MovieLogItem (4 tasks)

### TASK 3.1: Create MovieLogItem.unit.ts Test File
**Priority**: P1 (High)  
**Type**: Test Implementation  
**Effort**: 45 minutes  
**File**: `src/features/movie/components/MovieLogItem.unit.ts`

**Test Setup**:
- [ ] Import dependencies: `vitest`, `@testing-library/react`, test utilities
- [ ] Import component: `MovieLogItem`
- [ ] Mock useNavigate from react-router-dom
- [ ] Create mock LogListItem data

**Test Cases** (Minimum 5):

**T3.1.1: Component Renders Without Crashing**
- [ ] Renders with valid mock log data
- [ ] Assertion: Component is in DOM

**T3.1.2: Movie Title is Clickable Element**
- [ ] Title element has `role="button"`
- [ ] Title element has `aria-label` containing movie title
- [ ] Assertion: Element is rendered and accessible

**T3.1.3: Click Handler Calls Navigate with Correct Route**
- [ ] User clicks title element
- [ ] Verify `navigate` was called with `/movies/{tmdbId}`
- [ ] Assertion: `expect(navigate).toHaveBeenCalledWith('/movies/550')`

**T3.1.4: Navigate Called Only When tmdbId Exists**
- [ ] Test with valid tmdbId: navigate called
- [ ] Test with tmdbId as 0 or undefined: navigate not called
- [ ] Assertion: Conditional navigation works

**T3.1.5: Component Renders All Expected Content**
- [ ] Movie title renders
- [ ] Poster image div renders
- [ ] Watch date renders
- [ ] Vote average renders
- [ ] Assertion: All content elements present

**Acceptance Criteria**:
- [ ] File `MovieLogItem.unit.ts` created alongside component
- [ ] All 5 test cases pass: `bun run test MovieLogItem.unit.ts`
- [ ] Coverage for component: >80% lines, >80% branches
- [ ] No console warnings during test
- [ ] Test file is properly typed (TypeScript)
- [ ] Mock data matches LogListItem type shape

**Implementation Approach**:
- Use `render()` from @testing-library/react
- Use `vi.mock()` to mock useNavigate
- Use `userEvent.click()` for interactions
- Use `screen.getByRole()` or `screen.getByTestId()` for element queries

**Testing**: Self (unit tests are the test)

---

### TASK 3.2: Test Movie Title Navigation With Various tmdbIds
**Priority**: P2 (Medium)  
**Type**: Test Enhancement  
**Effort**: 20 minutes  
**File**: `src/features/movie/components/MovieLogItem.unit.ts` (add to existing)

**Additional Test Cases**:

**T3.2.1: Navigation With Different tmdbIds**
- [ ] Test with tmdbId = 550 (Fight Club)
- [ ] Test with tmdbId = 278 (Shawshank Redemption)
- [ ] Test with tmdbId = 1 (small number)
- [ ] Test with tmdbId = 999999 (large number)
- [ ] Assertion: navigate called with correct route each time

**T3.2.2: Navigation Ignores Non-numeric tmdbIds**
- [ ] Test behavior if tmdbId is somehow not a number (edge case)
- [ ] Assertion: No error thrown, graceful handling

**Acceptance Criteria**:
- [ ] Add 2-3 additional test cases to existing file
- [ ] All tests pass: `bun run test MovieLogItem.unit.ts`
- [ ] Tests are parameterized or use test.each() if possible
- [ ] No changes to existing passing tests

**Related**: TASK 3.1 (extends unit test file)

---

### TASK 3.3: Test Missing or Null Movie Data Gracefully
**Priority**: P2 (Medium)  
**Type**: Test Enhancement  
**Effort**: 15 minutes  
**File**: `src/features/movie/components/MovieLogItem.unit.ts` (add to existing)

**Test Cases**:

**T3.3.1: Handles Missing movie Object**
- [ ] Render with log.movie = undefined
- [ ] Verify fallback content renders (e.g., "Unknown Title")
- [ ] Verify click still navigates with log.tmdbId

**T3.3.2: Handles Missing posterPath**
- [ ] Render with posterPath = undefined
- [ ] Verify placeholder message appears in poster div
- [ ] Click navigation still works

**Acceptance Criteria**:
- [ ] Add 2 test cases for edge cases
- [ ] All tests pass
- [ ] Covers null/undefined scenarios for optional fields

**Related**: TASK 3.1 (extends unit test file)

---

### TASK 3.4: Verify Unit Test Coverage and Fix Gaps
**Priority**: P1 (High)  
**Type**: Test Coverage  
**Effort**: 20 minutes

**Execution**:
- [ ] Run: `bun run test:coverage MovieLogItem.unit.ts`
- [ ] Review coverage report
- [ ] Target: >90% line coverage for MovieLogItem component

**Acceptance Criteria**:
- [ ] Line coverage: >90%
- [ ] Branch coverage: >85%
- [ ] Function coverage: 100%
- [ ] All code paths tested (click handler, conditional logic)
- [ ] No "Uncovered lines" warnings for production code

**If Coverage Gaps Found**:
- [ ] Identify missing test paths
- [ ] Add test cases to cover gaps
- [ ] Re-run coverage report
- [ ] Iterate until target coverage met

**Related**: TASK 3.1-3.3 (depends on all unit tests)

---

## Phase 4: Integration Tests for Navigation Flow (3 tasks)

### TASK 4.1: Create MovieLogItem.integration.ts Test File
**Priority**: P1 (High)  
**Type**: Test Implementation  
**Effort**: 60 minutes  
**File**: `src/features/movie/components/MovieLogItem.integration.ts`

**Test Setup**:
- [ ] Setup React Router for testing (BrowserRouter or MemoryRouter)
- [ ] Mock API calls to fetch movie details (if needed)
- [ ] Create realistic test data
- [ ] Setup test utilities for navigation

**Test Cases** (Minimum 4):

**T4.1.1: Navigate From List Item to Detail Page**
- [ ] Render MovieLogItem with React Router setup
- [ ] Click movie title
- [ ] Verify navigation changed (URL or history)
- [ ] Assertion: Route path contains `/movies/{tmdbId}`

**T4.1.2: Detail Page Displays Correct Movie Data**
- [ ] Navigate from MovieLogItem to detail page
- [ ] Detail page fetches and displays movie information
- [ ] Verify correct movie is displayed (title, poster, etc.)
- [ ] Assertion: Movie data matches clicked item

**T4.1.3: Back Button Returns to List**
- [ ] Navigate from list item to detail page
- [ ] Click back button (or use navigate(-1))
- [ ] Verify returned to previous page
- [ ] Assertion: URL returns to list route

**T4.1.4: Error Handling When Detail Data Fails**
- [ ] Mock API to return error for detail page
- [ ] Click movie title
- [ ] Verify error message appears
- [ ] Verify back button available to user
- [ ] Assertion: Error state rendered correctly

**Acceptance Criteria**:
- [ ] File `MovieLogItem.integration.ts` created alongside component
- [ ] All 4 test cases pass: `bun run test MovieLogItem.integration.ts`
- [ ] Tests use real React Router (not mocked)
- [ ] Tests can navigate and verify route changes
- [ ] No reliance on live API (use mocks)
- [ ] Tests are deterministic (same result every run)

**Implementation Approach**:
- Use MemoryRouter or BrowserRouter from react-router-dom
- Use `renderWithRouter()` or custom render function
- Use `screen.findByText()` with async/await for async data loading
- Mock API calls with vi.mock()
- Check URL or use getByText() to verify page changed

**Testing**: Self (integration tests are the test)

---

### TASK 4.2: Test Scroll Position Preservation on Back Navigation
**Priority**: P2 (Medium)  
**Type**: Test Enhancement  
**Effort**: 30 minutes  
**File**: `src/features/movie/components/MovieLogItem.integration.ts` (add to existing)

**Test Case**:

**T4.2.1: Scroll Position Restored After Back Navigation**
- [ ] Render list with multiple items
- [ ] Scroll to middle of list
- [ ] Click movie title to navigate away
- [ ] Navigate back using back button
- [ ] Verify scroll position is approximately same as before

**Implementation Notes**:
- React Router automatically preserves scroll in browser history
- Test may need to manually scroll to position first
- Can verify by checking scroll offset before/after navigation

**Acceptance Criteria**:
- [ ] Add 1 test case for scroll preservation
- [ ] Test demonstrates scroll position is maintained
- [ ] Test handles approximation (exact pixels not required)

**Related**: TASK 4.1 (extends integration test file)

---

### TASK 4.3: Test Loading and Error States End-to-End
**Priority**: P2 (Medium)  
**Type**: Test Enhancement  
**Effort**: 40 minutes  
**File**: `src/features/movie/components/MovieLogItem.integration.ts` (add to existing)

**Test Cases**:

**T4.3.1: Skeleton Screen Displays While Data Loads**
- [ ] Mock API with delay (simulate slow network)
- [ ] Click movie title
- [ ] Verify loading/skeleton state appears
- [ ] Wait for data to load
- [ ] Verify content loads and skeleton disappears

**T4.3.2: Error Message Shows When API Fails**
- [ ] Mock API to reject with error
- [ ] Click movie title
- [ ] Verify error message displayed
- [ ] Verify back button available and works
- [ ] Assertion: Error state matches spec (generic message, back button)

**T4.3.3: Retry Behavior After Error**
- [ ] Error occurs on first navigation
- [ ] User clicks back to list
- [ ] User clicks same movie title again
- [ ] Verify second attempt works (API responds)
- [ ] Assertion: Detail page loads successfully on retry

**Acceptance Criteria**:
- [ ] Add 3 test cases to integration test file
- [ ] All tests pass
- [ ] Tests verify user experience matches spec requirements
- [ ] Loading and error states testable

**Related**: TASK 4.1 (extends integration test file)

---

## Phase 5: Validation & Polish (2 tasks)

### TASK 5.1: Run Complete Test Suite and Fix Failures
**Priority**: P0 (Blocking)  
**Type**: Validation  
**Effort**: 45 minutes

**Execution**:
- [ ] Run all tests: `bun run test:run`
- [ ] Verify no failures in unit or integration tests
- [ ] Generate coverage report: `bun run test:coverage`
- [ ] Review coverage summary

**Acceptance Criteria**:
- [ ] All unit tests pass (TASK 3.x)
- [ ] All integration tests pass (TASK 4.x)
- [ ] Overall coverage >80% for modified files
- [ ] No TypeScript compilation errors
- [ ] No console errors or warnings in test output

**If Tests Fail**:
- [ ] Review error messages
- [ ] Fix test issues or implementation bugs
- [ ] Re-run failed tests
- [ ] Iterate until all pass

**Related**: TASK 3.1-4.3 (depends on all test tasks)

---

### TASK 5.2: Final Validation and Code Quality Checks
**Priority**: P0 (Blocking)  
**Type**: Validation  
**Effort**: 30 minutes

**Checks**:
- [ ] Run ESLint: `bun run lint` - no errors in modified files
- [ ] Run build: `bun run build` - completes without errors
- [ ] Manual testing in dev server: navigate works smoothly
- [ ] Review test file naming: `.unit.ts` and `.integration.ts` correctly named
- [ ] Verify test files run independently: `bun run test MovieLogItem.unit.ts`
- [ ] Check code documentation (comments explain complex logic if needed)

**Acceptance Criteria**:
- [ ] ESLint passes: `bun run lint`
- [ ] TypeScript compiles: `bun run build`
- [ ] All tests pass: `bun run test:run`
- [ ] Coverage report generated successfully
- [ ] Manual navigation works end-to-end
- [ ] Test files follow naming convention
- [ ] No breaking changes to existing features

**Related**: TASK 2.1-5.1 (final validation of all work)

---

## Task Dependencies Map

```
Phase 1: Setup
├─ TASK 1.1: vitest.config.ts
├─ TASK 1.2: Install dependencies
├─ TASK 1.3: Update package.json
└─ TASK 1.4: Create setup file

Phase 2: Implementation
├─ TASK 2.1: Modify MovieLogItem ← (Depends on Phase 1)
├─ TASK 2.2: Verify routing
└─ TASK 2.3: Manual testing ← (Depends on TASK 2.1)

Phase 3: Unit Tests
├─ TASK 3.1: Create unit test file ← (Depends on TASK 2.1, Phase 1)
├─ TASK 3.2: Additional test cases ← (Depends on TASK 3.1)
├─ TASK 3.3: Edge case tests ← (Depends on TASK 3.1)
└─ TASK 3.4: Coverage validation ← (Depends on TASK 3.1-3.3)

Phase 4: Integration Tests
├─ TASK 4.1: Create integration test ← (Depends on TASK 2.1, Phase 1)
├─ TASK 4.2: Scroll position tests ← (Depends on TASK 4.1)
└─ TASK 4.3: Loading/Error tests ← (Depends on TASK 4.1)

Phase 5: Validation
├─ TASK 5.1: Run test suite ← (Depends on TASK 3.4, 4.1-4.3)
└─ TASK 5.2: Final checks ← (Depends on TASK 5.1)
```

## Execution Order

**Recommended execution order** (respecting dependencies):
1. TASK 1.1 → 1.2 → 1.3 → 1.4 (Setup in parallel possible)
2. TASK 2.1 → 2.2 → 2.3 (Sequential)
3. TASK 3.1 → 3.2 → 3.3 → 3.4 (Sequential)
4. TASK 4.1 → 4.2 → 4.3 (Sequential)
5. TASK 5.1 → 5.2 (Sequential)

**Estimated Total Time**: 8-10 hours

---

## Definition of Done

All tasks are considered complete when:
- [ ] All acceptance criteria met for each task
- [ ] All test cases pass
- [ ] Code coverage >80% for modified components
- [ ] ESLint passes
- [ ] TypeScript builds without errors
- [ ] Feature branch ready for PR review
- [ ] Feature spec and plan documents updated if needed
