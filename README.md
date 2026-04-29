# Cinelog

Cinelog is a movie tracking project currently in active development, created from my own need to keep track of the movies I watch. I go to the cinema very often, and I wanted a simple way to record what I watched, where I watched it, and explore personal stats with everything always in my pocket.

This repository contains the web frontend for Cinelog. The project already lets you track watched movies, record where you watched them, and view personal stats. Because the project moved quickly in the beginning, I am currently restructuring parts of it while continuing to ship new features. I plan to expand Cinelog a lot over time, including building a dedicated app.

## Current Features

- Authentication flows: login, registration, forgot password, and reset password
- Movie search and movie details
- Watched movie logging
- Tracking where a movie was watched
- Profile pages
- Personal stats and watch-method breakdowns

## Tech Stack

- React 19
- TypeScript
- Vite (`rolldown-vite`)
- Tailwind CSS v4
- Zustand
- i18next
- Vitest
- Playwright
- Bun
- Plop generators

## Getting Started

1. Install dependencies:

   ```bash
   bun install
   ```

2. Create your local environment file:

   ```bash
   cp .env.example .env
   ```

3. Set the required environment variable:

   - `VITE_API_URL`

4. Start the development server:

   ```bash
   bun run dev
   ```

## Available Scripts

- `bun run dev` starts the Vite development server
- `bun run build` runs TypeScript compilation and creates a production build
- `bun run preview` serves the production build locally
- `bun run lint` runs Biome checks
- `bun run lint:fix` runs Biome with auto-fix
- `bun run test` starts Vitest
- `bun run test:ui` starts the Vitest UI
- `bun run test:coverage` runs the full test suite with coverage
- `bun run test:unit` runs unit tests
- `bun run test:unit:coverage` runs unit tests with coverage
- `bun run test:integration` runs integration tests
- `bun run test:integration:coverage` runs integration tests with coverage
- `bun run generate:feature` scaffolds a new feature with Plop
- `bun run generate:component` scaffolds a new component with Plop

## Project Structure

- `src/routes/` contains top-level routing
- `src/features/` contains feature modules organized by domain
- `src/lib/` contains shared infrastructure, hooks, layout, and UI
- `public/` contains static assets
- `scripts/plop/` contains project generators
- `docs/programming-rules/` contains project-specific programming rules

## Environment Variables

- `VITE_API_URL` base URL for the backend API

## Testing And Quality

Before opening a pull request, run:

```bash
bun run lint
bun run build
bun run test:unit
bun run test:integration
```

## Related Repository

- Backend: [cinelog_server](https://github.com/benincasantonio/cinelog_server)

Some of the ongoing restructuring and feature work in this frontend also needs to be reflected in the backend repository.

## Contributing

Any contribution is welcome.

If you want to contribute, please make sure the changes are well designed and aligned with the existing project structure.

AI-assisted pull requests are welcome only if the generated code has been fully reviewed and the final solution is thoughtful and well designed.

## Status

Cinelog is in active development. Part of the current work is improving and restructuring the foundation of the project while continuing to add new features.
