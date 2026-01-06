# Professional Project Audit: Movie Tracking Application

## Executive Summary
The application follows a solid feature-based vertical slice architecture, which is excellent for scalability. However, as the project grows, signs of "feature leakage," "class soup," and tight coupling between data fetching and UI components are emerging. This audit provides targeted recommendations to harden the architecture, optimize the UI implementation, and improve separation of concerns.

---

## 1. Feature-Based Organization

### Current State
- **Structure:** You have a clear `src/features/` directory with logical slices (`auth`, `movie`, `movie-search`, etc.).
- **Encapsulation:** Features generally use `index.ts` files, but the exports are often "barrel files" (`export * from "./..."`) that expose too much internal logic.
- **Leakage:** There are instances of cross-feature imports that violate encapsulation.
  - *Example:* `src/features/logs/components/LogMovieForm.tsx` imports directly from `src/features/movie-search/repositories`.
  - *Example:* `src/features/movie/pages/MovieDetailsPage.tsx` imports `useCreateMovieLogDialogStore` from `@/features/logs/store`.

### Recommendations

#### A. Enforce a Strict Public API
Modify your `index.ts` files to export **only** what is intended for public consumption. Do not export internal repositories, raw stores, or utility components that are private to the feature.

**Refactor Example (`src/features/movie/index.ts`):**
```typescript
// ✅ Good: Only export what other features need (Pages, Container Components, Models)
export { MovieDetailsPage } from "./pages/MovieDetailsPage";
export { MoviesWatched } from "./components/MoviesWatched";
export type { MovieDetails } from "./models";

// ❌ Avoid: Exporting internal repositories or specific UI atoms
// export * from "./repositories";
// export * from "./components/InternalHelper";
```

#### B. Dependency Rule Enforcement
- **Rule:** A feature should never import from another feature's *internals*. It should only import from the public `index.ts`.
- **Linting:** Consider using `eslint-plugin-boundaries` to enforce this automatically.

---

## 2. Zustand Implementation

### Current State
- **Store Structure:** Stores like `useMovieDetailsStore` act as "God Stores" for the feature, mixing data fetching, business logic, and UI state.
- **Async Logic:** Data fetching (`loadMovieDetails`) is baked directly into the store actions. This makes the store harder to unit test without mocking API calls and tightly couples state to data fetching.

### Recommendations

#### A. Adopt the Slice Pattern (or Multiple Stores)
For complex features like `movie`, separate **Entity State** (cached data) from **UI State** (modals, form inputs).

**Proposed Structure:**
- `useMovieDataStore`: Handles caching movie objects (normalized data).
- `useMovieUIStore`: Handles local UI state (isModalOpen, activeTab).

#### B. Extract Async Actions
Move side effects (API calls) out of the store or use a dedicated data-fetching layer (like TanStack Query) alongside Zustand. If sticking with Zustand only, keep the store focus on *state updates*, not *data retrieval*.

**Refactor Example (Separating Actions):**
```typescript
// actions/fetchMovie.ts
export const fetchMovieDetails = async (id: number) => {
  useMovieDetailsStore.setState({ isLoading: true });
  try {
    const data = await api.getDetails(id);
    useMovieDetailsStore.setState({ details: data, isLoading: false });
  } catch (error) {
    useMovieDetailsStore.setState({ isLoading: false, error });
  }
};
```

---

## 3. Tailwind & UI Optimization

### Current State
- **Class Soup:** Components like `MovieDetailsHero.tsx` contain long, hard-to-read class strings.
  - *Example:* `className="absolute -bottom-16 left-4 right-4 flex items-end gap-4 md:left-8 md:right-8"`
- **Hardcoded Values:** There are magic numbers (e.g., `h-[300px]`) that should be part of the theme.

### Recommendations

#### A. Install Utility Libraries
You are missing key standard libraries for managing Tailwind classes.
- **Install:** `npm install clsx tailwind-merge class-variance-authority`

#### B. Implement `cn` Utility
Create a standard utility to merge classes safely.

`src/lib/utils.ts`:
```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

#### C. Use CVA for Complex Components
For components with variants (like Badges, Buttons, or Movie Cards), use `class-variance-authority` (CVA).

**Example (`MovieRatingBadge.tsx`):**
```typescript
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva("rounded-full px-2 py-1 text-sm font-medium", {
  variants: {
    variant: {
      success: "bg-green-100 text-green-800",
      warning: "bg-yellow-100 text-yellow-800",
      danger: "bg-red-100 text-red-800",
    },
    size: {
      sm: "text-xs",
      md: "text-sm",
    },
  },
  defaultVariants: {
    variant: "success",
    size: "md",
  },
});
```

#### D. Extend Tailwind Config
Since you are using Tailwind v4 (`src/index.css`), define your design tokens there instead of hardcoding pixels.

`src/index.css`:
```css
@theme {
  --spacing-hero-height-mobile: 300px;
  --spacing-hero-height-desktop: 400px;
}
```
Usage: `h-hero-height-mobile md:h-hero-height-desktop`

---

## 4. Performance & Logic

### Current State
- **Smart Components:** `MovieDetailsPage.tsx` triggers data fetching via `useEffect`. This leads to "waterfall" fetching if children also need data.
- **Coupling:** The page component knows *too much* about how data is loaded (`loadMovieDetails`, `loadMovieRating`).

### Recommendations

#### A. Container/Presenter Pattern
Split `MovieDetailsPage` into a **Container** (Logic) and **View** (UI).

**`MovieDetailsContainer.tsx`:**
- Handles `useParams`.
- Calls `loadMovieDetails`.
- Selects data from store.
- Renders `<MovieDetailsView />`.

**`MovieDetailsView.tsx`:**
- Pure UI component.
- Accepts `movie` and `rating` as props.
- No side effects or store subscriptions.

#### B. Custom Hooks for Data Access
Encapsulate the store selection and fetching logic into a hook.

**`useMovie.ts`:**
```typescript
export const useMovie = (id: number) => {
  const { movieDetails, loadMovieDetails } = useMovieDetailsStore();

  useEffect(() => {
    if (id && !movieDetails) {
      loadMovieDetails(id);
    }
  }, [id, movieDetails]);

  return { movie: movieDetails };
};
```
This cleans up your components significantly.

---

## Summary of Action Plan
1.  **Dependencies:** Add `clsx`, `tailwind-merge`, and `cva`.
2.  **Utils:** Add `cn()` utility in `src/lib/utils.ts`.
3.  **Refactor:** Pick **one** feature (e.g., `movie`) and apply the **Container/Presenter** pattern and strict **Public API** exports as a pilot.
4.  **Config:** Move hardcoded pixel values from `MovieDetailsHero` into `src/index.css` theme variables.
