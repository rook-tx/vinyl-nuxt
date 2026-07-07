import { db } from '~~/server/utils/db'
import { toRecordItem } from '~~/server/utils/catalog'

export default defineEventHandler(async () => {
  const records = await db.record.findMany({
    include: {
      artists: {
        include: {
          artist: true,
        },
      },
      played: true,
    },
    orderBy: {
      title: 'asc',
    },
  })

  return records.map(toRecordItem)
})
