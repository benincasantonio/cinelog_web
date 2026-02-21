# Cinelog Web

Cinelog Web is the React + TypeScript client for Cinelog, built with Vite (rolldown-vite) and Tailwind CSS.

## Getting Started

1. Install dependencies: `bun install`
2. Create environment config: `cp .env.example .env`
3. Fill in `VITE_*` values.
4. Start the dev server: `bun run dev`

## Scripts

- `bun run dev` starts the Vite dev server.
- `bun run build` runs `tsc -b` and builds the production bundle.
- `bun run preview` serves the production build locally.
- `bun run lint` runs Biome (linting + formatting check).
- `bun run lint:fix` runs Biome with auto-fix.
- `bun run generate:feature` scaffolds a new feature module.
- `bun run generate:component` scaffolds a new component.

## Project Structure

- `src/routes/` contains top-level routing (`AppRoutes.tsx`).
- `src/features/<feature>/` holds feature modules (kebab-case).
- `src/lib/` contains shared infrastructure and UI.
- `public/` contains static assets.
- `scripts/plop/` contains generators.

## Environment Variables

Use `.env` with the following keys:

- `VITE_API_URL`

## Testing

No test runner is configured yet. Validate changes with `bun run lint` and `bun run build`.
