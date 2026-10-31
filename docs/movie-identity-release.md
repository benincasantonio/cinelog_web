# Canonical movie identity release

Frontend #97 and #98 target [backend PR #279](https://github.com/benincasantonio/cinelog_server/pull/279), verified at `0385036e30146a747623d6eef9bb66ab7dabb002`.

## Contract

- Search returns `{ results, nextCursor }`. Each result has a UUID `id` or an opaque `movieRef`; the other field is null. Cursors are bound to query and locale. An empty page can still have a next cursor.
- Catalog results open directly. Selecting a reference calls `POST /v1/movies/resolve` with exactly `{ movieRef }`, returning `{ movieId }`. Searching never imports movies.
- Details and ratings use `GET /v1/movies/{movieId}` and `GET /v1/movie-ratings/{movieId}`. Rating status 204 means no rating.
- Creation of logs and ratings requires `movieId`. There is no public `tmdbId` or numeric fallback; unknown write fields are rejected. Log update/delete still uses the log's own `id`.
- Browser URLs are `/movies/<uuid>`. Numeric bookmarks intentionally show not-found without detail, rating or resolve calls. Unknown UUIDs are never treated as references.

## Search behavior

Main search retains its three-character minimum and 500 ms debounce. Scrolling loads another cursor page, with a keyboard-operated Load more fallback. Loading failures preserve results and pause scrolling until Retry; invalid cursors require Search again. Back starts a new search. The log picker retains its existing first-page behavior and 300 ms debounce.

Resolution errors appear inline and preserve input. Invalid references require a fresh search, unavailable movies require another selection, and temporary errors allow Retry. Request guards discard late responses after selection changes, reset or departure. Discarding a response does not undo a backend import already in progress.

## Stacked delivery

The #97 base includes shared search/resolve contracts, UUID navigation, scrolling, and the mechanical UUID changes required by log/rating callers: types, payloads, validation, reads, dialog identity and prefill. Its unresolved log selections cannot submit. #98 completes reference resolution in the log picker and selection/save lifecycle handling. Neither branch is a standalone release.

Acceptance criteria from #98 implemented in the #97 base so it can build and pass independently:

| Criterion | Base behavior |
|---|---|
| Canonical request/response models and payloads | Required UUID `movieId`; no `tmdbId` or `posterPath` write fields |
| Canonical rating reads | UUID endpoint and unchanged 204 handling |
| Detail prefill and modal identity | UUID retained without resolution or numeric parsing |
| Existing log editing | UUID context; update/delete still target `log.id` and cannot reassign the movie |

#98 adds selected-reference resolution, inline recovery, and guards for log/rating dialog lifecycles. It also checks rating response identity before applying results.

## Deployment and rollback

1. Verify both frontend tickets and backend #279 together. The backend must have `MOVIE_REF_HMAC_SECRET` configured in every instance. This cutover introduces no database migration.
2. Deploy the completed frontend and backend in one release window. Old-client/new-server and new-client/old-server combinations are unsupported.
3. Invalidate cached frontend assets. Already-open old browser sessions must reload before their movie operations will work; there is no compatibility adapter.
4. Smoke-test search → select/import → UUID details → rating → log → history, direct reload, and numeric-link rejection.
5. Roll back both artifacts to the previous compatible pair together. Imported movies remain valid records; no database rollback is required for this identity change.

## Validation

Run `bun run test:unit`, `bun run test:integration`, `bun run lint`, `bun run build`, `bun run check:locales`, and `bunx playwright test e2e/movie-identity.spec.ts --project=chromium`. Browser tests use authenticated API fixtures matching PR #279. The same round trip must also pass against the backend branch before deployment.

### #97 base verification — 2026-10-31

914 unit tests, 89 integration tests, and 4 Chromium scenarios passed. Build and locale validation passed. Lint passed against a clean export of the exact base snapshot, with the pre-existing `MoviesWatched` effect-dependency warning. The original workspace's unrelated untracked `fm-graphics-manager` JSON fails formatting; it was preserved.
