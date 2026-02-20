import {
  createMigration,
  createWriteClient,
  PendingPrismicDocument,
} from '@prismicio/client'

type RecordData = {
  title: string | null
  record_id: string | null
  year: number | null
  original_year: number | null
  discs: number | null
  label: string | null
  notes: string | null
}

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
  const uid = body.title.toLowerCase().replace(/\s+/g, '-').replace(/'/g, '')

  const document: PendingPrismicDocument = {
    lang: 'en-gb',
    type: 'record',
    uid: uid,
    data: {
      title: body.title,
      record_id: body.record_id,
      year: body.year,
      original_year: body.original_year,
      label: body.label ?? '',
      discs: body.discs ?? 1,
      notes: body.notes,
    },
  }

  console.log('Creating migration for document:', document)

  try {
    migration.createDocument(document, body.title)

    await migrateClient
      .migrate(migration, {
        reporter(event) {
          console.log(event.type)
        },
      })
      .catch((error) => {
        throw new Error('Migration failed', { cause: error })
      })
  } catch (error) {
    console.error('Error creating migration:', error)
    throw new Error('Failed to create migration')
  }

  return {
    client: 'migrated',
  }
})
