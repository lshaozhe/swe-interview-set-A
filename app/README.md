# TeamMetrics

A multi-tenant analytics dashboard. Organisations see their reports, export them, and admins manage users.

```bash
npm install
npm run dev:server   # API on :3000 (embedded Postgres, seeded)
npm run dev:client   # web app on :5173
npm test
```

Demo logins (password `password123`): `alice@acme.com` (admin), `bob@acme.com`.

Production configuration (`src/server/config.ts`) points at hosted Postgres and Redis; local runs use an embedded Postgres and an in-process cache so nothing else needs to be installed.

## The exercise

Review this codebase as if a teammate opened a pull request to take it to production. Tell us what you notice, what matters most and why, and what you would change first.
