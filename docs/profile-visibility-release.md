# Followers-Only Profile Visibility Release

The `followers_only` profile visibility value is a breaking replacement for
`friends_only`. The frontend and backend intentionally do not accept the other
version's wire value, so
[cinelog_web#70](https://github.com/benincasantonio/cinelog_web/issues/70) and
[cinelog_server#195](https://github.com/benincasantonio/cinelog_server/issues/195)
must ship as one coordinated release.

The backend's
[technical profile-visibility guide](https://github.com/benincasantonio/cinelog_server/blob/main/docs/technical/profile-visibility.md)
is the authoritative migration and database verification runbook.

## Deployment

Prefer roll-forward after backend migration `005_rename_profile_visibility`
reaches production.

1. Rehearse the backend migration and prepare matching backend and frontend
   release artifacts.
2. If any client/server mismatch is unacceptable, enable a short maintenance or
   read-only window for registration and profile settings.
3. Deploy the new backend first and wait for its automatic Alembic migration to
   finish.
4. Confirm the database is at revision `005_rename_profile_visibility`. Verify
   that migrated rows use `followers_only` and that the profile-visibility check
   constraint allows exactly `public`, `followers_only`, and `private`.
5. Smoke-test the backend contract: registration and profile updates accept and
   return `followers_only`, while `friends_only` receives a validation error.
6. Deploy this frontend immediately after the backend smoke check.
7. Complete the frontend smoke checks below, then disable maintenance/read-only
   mode if it was enabled.

## Frontend Smoke Checks

- Open registration and confirm Public, Followers only, and Private are visible,
  with Private selected by default.
- Register a smoke-test account with Followers only and confirm the account is
  created with `profileVisibility: "followers_only"`.
- In profile settings, change visibility to Followers only, save, reload, and
  confirm the selection persists.
- Open the smoke-test account's own profile and confirm it renders normally.
- Open an existing profile migrated from the legacy follower-only value and
  confirm its full content remains restricted to another user until follower
  authorization is delivered.
- Recheck an existing Public and Private profile to confirm their behavior is
  unchanged.

## Rollback

Use rollback only when roll-forward is not viable.

1. Enable maintenance mode for registration and profile settings.
2. While the new backend image that contains revision
   `005_rename_profile_visibility` is still deployed, downgrade the database:

   ```bash
   docker compose -f docker-compose.prod.yml run --rm --no-deps db-migrate alembic downgrade 004_create_logs_table
   docker compose -f docker-compose.prod.yml run --rm --no-deps db-migrate alembic current
   ```

3. Confirm revision `004_create_logs_table`, the reverse data conversion, and
   the restored database constraint.
4. Deploy the old backend and old frontend together.
5. Smoke-test registration and profile settings against the restored contract,
   then disable maintenance mode.

Do not deploy the old backend image before the downgrade. The old image does not
contain migration revision `005` and may be unable to resolve the database's
current revision.
