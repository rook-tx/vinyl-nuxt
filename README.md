# Vinyl Collection

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
AUTH_SECRET="a-long-random-secret"
AUTH_SESSION_TTL_SEC="86400"
```

This gate is intentionally local-first: users sign in with email + password and receive an HTTP-only cookie session. The auth logic is centralized in `server/utils/auth.ts`, making it straightforward to replace with a full provider later.

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

This seed uses [prisma/seed.mjs](prisma/seed.mjs) and creates the first local user:

- display name: `tom`
- email: `twcorb@gmail.com`
- password: `collection`

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

## One-Time Legacy Import (Optional)

Prismic is not used as a runtime CMS in this app.
The importer below exists only for initial/legacy data migration into the local database.

1. Add legacy source auth in your local .env file.

```bash
PRISMIC_REPOSITORY="vinyl"
PRISMIC_ACCESS_TOKEN="your-prismic-read-token"
```

2. Make sure your local Postgres is running and schema is synced.

```bash
npm run db:up
npm run db:push
```

3. Run the importer once.

```bash
npm run db:import:prismic
```

The importer is intended for initial bootstrap and will stop if the database already has data.
If you intentionally want to rerun import and overwrite linked data, use:

```bash
npm run db:import:prismic:overwrite
```

Dry-run preview (no DB writes):

```bash
npm run db:import:prismic:dry
```

What importer does:

- Reads all artist and record documents from Prismic.
- Upserts artists first, then upserts records and links their artist.
- Converts Prismic rich text notes to plain text.
- For records with played dates in Prismic, adds that record to tom's personal collection (one item per record) and writes those play dates to the personal item.

After import, the app runs entirely on Postgres and API endpoints in this repository.

Import report:

- Every run writes a JSON report to `prisma/reports/prismic-import-latest.json`.
- You can override the report path:

```bash
node prisma/import-prismic.mjs --report=prisma/reports/my-import.json
```

Importer script location: [prisma/import-prismic.mjs](prisma/import-prismic.mjs)

## Deployment Note

Use a managed PostgreSQL provider in deployment and set `DATABASE_URL` in environment variables.
