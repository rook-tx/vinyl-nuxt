# Vinyl Collection (Self-Hosted DB)

This project now uses a self-hosted PostgreSQL database (via Docker) and Prisma instead of Prismic.

## Local Setup (Docker + Postgres)

1. Install dependencies.

```bash
npm install
```

2. Copy env values if needed.

```bash
cp .env.example .env
```

Set auth values in `.env` before using write actions in the app:

```bash
AUTH_ENABLED="true"
AUTH_PASSWORD="your-local-password"
AUTH_SECRET="a-long-random-secret"
AUTH_SESSION_TTL_SEC="86400"
```

This gate is intentionally local-first: a single password creates an HTTP-only cookie session. The auth logic is centralized in `server/utils/auth.ts`, making it straightforward to replace with a full provider later.

3. Start the local database container.

```bash
npm run db:up
```

4. Create/update database schema.

```bash
npm run db:push
```

5. Seed starter data.

```bash
npm run db:seed
```

This seed uses [prisma/seed.mjs](prisma/seed.mjs) and inserts a small starter dataset (Miles Davis + 2 records) with idempotent upserts.

6. Start Nuxt dev server.

```bash
npm run dev
```

## Useful DB Commands

```bash
npm run db:studio
npm run db:down
```

## Tests

```bash
npm run test
npm run test:watch
```

Current tests cover record/artist serialization and record selection utility behavior.

## Import Existing Content From Prismic

1. Add repository auth in your local .env file.

```bash
PRISMIC_REPOSITORY="vinyl"
PRISMIC_ACCESS_TOKEN="your-prismic-read-token"
```

2. Make sure your local Postgres is running and schema is synced.

```bash
npm run db:up
npm run db:push
```

3. Run the importer.

```bash
npm run db:import:prismic
```

Dry-run preview (no DB writes):

```bash
npm run db:import:prismic:dry
```

Strict relationship mode (fails if one record is linked to multiple artists in Prismic):

```bash
npm run db:import:prismic:strict
```

Strict dry-run:

```bash
npm run db:import:prismic:strict:dry
```

What importer does:

- Reads all artist and record documents from Prismic.
- Upserts artists first, then upserts records and links their artist.
- Converts Prismic rich text notes to plain text.
- Replaces each record's played dates with Prismic played group values.

Import report:

- Every run writes a JSON report to `prisma/reports/prismic-import-latest.json`.
- In strict mode, conflicts are also written to the report before the command exits with a non-zero code.
- You can override the report path:

```bash
node prisma/import-prismic.mjs --report=prisma/reports/my-import.json
```

Importer script location: [prisma/import-prismic.mjs](prisma/import-prismic.mjs)

## Moving To A Real Hosted Database Later

1. Provision a hosted PostgreSQL database.
2. Replace `DATABASE_URL` in `.env` with the hosted connection string.
3. Run `npm run db:push` against that database.
4. Deploy the Nuxt app with the same `DATABASE_URL` environment variable.

Because both local and hosted environments are PostgreSQL, no code changes are needed for the move.
