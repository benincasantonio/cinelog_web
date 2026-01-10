# Quick Start Guide: Movie Title Navigation Feature

**Branch**: `001-movie-detail-nav`  
**Status**: Ready for Implementation  
**Documentation**: Complete (spec, plan, tasks)

## What's Implemented

✅ **Specification** (spec.md) - 74 lines
- Feature requirements clarified
- 5 user acceptance scenarios defined
- 7 functional requirements documented
- 4 measurable success criteria
- All clarifications resolved

✅ **Implementation Plan** (plan.md) - 259 lines
- Vitest configuration details
- Component changes required
- Testing strategy defined
- Risk assessment completed
- 5 implementation phases outlined

✅ **Detailed Task Breakdown** (tasks.md) - 589 lines
- 15 specific implementation tasks
- Acceptance criteria for each task
- Effort estimates
- Dependencies mapped
- Priority levels assigned

## What Gets Built

### Feature: Make Movie Titles Clickable

Users can now click on any movie title in their watched list to navigate to that movie's detail page.

**Changed Component**:
- `src/features/movie/components/MovieLogItem.tsx` - Add click handler + navigation

**Unchanged (Already Exist)**:
- `MovieDetailsPage.tsx` - Detail page (handles `:tmdbId` parameter)
- `/movies/:tmdbId` route - Already configured in AppRoutes.tsx
- Loading/error states - Already implemented in detail page

### Testing Infrastructure

**New Test Configuration**:
- `vitest.config.ts` - Test framework configuration
- `src/test/setup.ts` - Test utilities setup
- Updated `package.json` - Test scripts

**New Test Files** (alongside component):
- `MovieLogItem.unit.ts` - Unit tests (5-8 test cases)
- `MovieLogItem.integration.ts` - Integration tests (4-7 test cases)

## Quick Start Steps

### 1. Setup (Phase 1) - 30 minutes
```bash
# Install test dependencies
bun install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitest/ui

# Create config files (see tasks.md for content)
# - vitest.config.ts (at project root)
# - src/test/setup.ts
# - Update package.json with test scripts
```

### 2. Implement Feature (Phase 2) - 45 minutes
```bash
# Modify src/features/movie/components/MovieLogItem.tsx
# - Add useNavigate hook
# - Add click handler to title
# - Add accessibility attributes
# - Use log.tmdbId for navigation

# Test manually in dev server
bun run dev
# Navigate to watched movies → click a title → verify detail page loads
```

### 3. Write Tests (Phases 3-4) - 2 hours
```bash
# Create unit tests (MovieLogItem.unit.ts)
# - Component rendering
# - Click handler
# - Navigation calls
# - Edge cases

# Create integration tests (MovieLogItem.integration.ts)  
# - Full navigation flow
# - Error handling
# - Scroll position
# - Loading states

bun run test
bun run test:coverage
```

### 4. Validate (Phase 5) - 30 minutes
```bash
bun run test:run        # All tests must pass
bun run lint            # No ESLint errors
bun run build           # TypeScript builds cleanly
bun run test:coverage   # >80% coverage for modified files
```

## Key Technical Details

### Navigation Implementation
```typescript
// In MovieLogItem.tsx
const navigate = useNavigate();

const handleClick = () => {
  if (log.tmdbId) {
    navigate(`/movies/${log.tmdbId}`);
  }
};

// On title element:
<div onClick={handleClick} role="button" aria-label={...}>
  {log.movie?.title}
</div>
```

### Route Already Exists
- **Route Path**: `/movies/:tmdbId`
- **Component**: `MovieDetailsPage`
- **Route ID**: `movie-details`
- **Status**: No changes needed, ready to use

### Test Data
- `LogListItem` type has `tmdbId: number` (required field)
- `MovieResponse` type has `tmdbId: number`
- Example: tmdbId = 550 (Fight Club), tmdbId = 278 (Shawshank Redemption)

## File Locations

```
specs/001-movie-detail-nav/
├── spec.md              # Feature specification (what to build)
├── plan.md              # Implementation plan (how to build)
├── tasks.md             # Detailed tasks (step-by-step)
└── checklists/
    └── requirements.md  # Quality checklist (passed ✓)

src/features/movie/components/
├── MovieLogItem.tsx           # Component to modify
├── MovieLogItem.unit.ts       # Unit tests (to create)
└── MovieLogItem.integration.ts # Integration tests (to create)

(project root)
├── vitest.config.ts     # Test configuration (to create)
├── package.json         # Update with test scripts
└── src/test/setup.ts    # Test setup file (to create)
```

## Success Metrics

All of these should be true when feature is complete:

- [ ] Users can click movie title in watched list
- [ ] Navigates to `/movies/{tmdbId}` route
- [ ] Detail page displays correct movie
- [ ] Error message shown if data fails (with back button)
- [ ] Back button returns to list (scroll preserved)
- [ ] Skeleton screen shows while loading
- [ ] All tests pass: `bun run test:run`
- [ ] Coverage >80% for MovieLogItem component
- [ ] ESLint passes: `bun run lint`
- [ ] Builds successfully: `bun run build`

## Next Steps

1. **Review this guide** - Understand the scope
2. **Read specs/001-movie-detail-nav/spec.md** - Understand requirements
3. **Read specs/001-movie-detail-nav/plan.md** - Understand approach
4. **Follow specs/001-movie-detail-nav/tasks.md** - Execute implementation
5. **Run tests and validate** - Ensure quality
6. **Create PR** - Share changes for review

## Helpful Links

- **Feature Spec**: `specs/001-movie-detail-nav/spec.md`
- **Implementation Plan**: `specs/001-movie-detail-nav/plan.md`
- **Detailed Tasks**: `specs/001-movie-detail-nav/tasks.md`
- **Component to Modify**: `src/features/movie/components/MovieLogItem.tsx`
- **Existing Detail Page**: `src/features/movie/pages/MovieDetailsPage.tsx`
- **Routing Config**: `src/routes/AppRoutes.tsx`

## Questions?

Refer to the specification documents:
- **"What am I building?"** → Read `spec.md`
- **"How should I build it?"** → Read `plan.md`
- **"What are the specific tasks?"** → Read `tasks.md`
- **"What tests should I write?"** → Read `tasks.md` Phases 3-4

## Estimated Time

- Setup: 30 min
- Feature: 45 min
- Tests: 2 hours
- Validation: 30 min
- **Total: 3.5-4 hours** (including testing)

---

**Ready to start? Begin with Phase 1 in tasks.md** ✨
