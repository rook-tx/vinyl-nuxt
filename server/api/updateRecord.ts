import { createMigration, createWriteClient } from '@prismicio/client'

const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6InZpbnlsLTllMWE1NjdhLTE4YmItNDRhMy05YjBiLWMxNTk0ODNmMGY1OF81IiwiZGF0ZSI6MTc3MTUxNjUwMSwiZG9tYWluIjoidmlueWwiLCJhcHBOYW1lIjoidmlueWwtbnV4dCIsImlhdCI6MTc3MTUxNjUwMX0.uBqYKRgzqMRMf1UckHKnKlE9pzBmAJG7SgRabcoO99c`

const migrateClient = createWriteClient('vinyl', {
  writeToken: token,
})

export default defineEventHandler(async (event) => {
  if (!event) return

  const body = await readBody(event).catch(() => {})
  const migration = createMigration()

  migration.updateDocument({
    ...body.page,
    data: {
      ...body.page.data,
      played: [
        ...body.page.data.played,
        { date: new Date().toISOString().slice(0, 10) },
      ],
    },
  })

  await migrateClient.migrate(migration, {
    reporter(event) {
      console.log(event.type)
    },
  })

  return {
    client: 'migrated',
  }
})
