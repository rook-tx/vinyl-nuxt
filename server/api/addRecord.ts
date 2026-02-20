import { createMigration, createWriteClient } from '@prismicio/client'

const token = process.env.PRISMIC_WRITE_TOKEN

if (!token) {
  throw new Error('PRISMIC_WRITE_TOKEN is not set')
}

const migrateClient = createWriteClient('vinyl', {
  writeToken: token,
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event).catch(() => {})

  if (!body.title) {
    throw new Error('Title is required')
  }

  const migration = createMigration()

  migration.createDocument(
    {
      lang: 'en-gb',
      type: 'record',
      uid: body.title.toLowerCase().replace(/\s+/g, '-'),
      data: {
        title: body.title,
        record_id: body.record_id,
        year: Number(body.year),
        original_year: Number(body.original_year),
        label: body.label,
        discs: Number(body.discs),
      },
    },
    body.title
  )

  await migrateClient.migrate(migration, {
    reporter(event) {
      console.log(event.type)
    },
  })

  return {
    client: 'migrated',
  }
})
