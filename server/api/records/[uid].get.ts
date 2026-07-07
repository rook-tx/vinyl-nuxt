import { createError } from 'h3'
import { db } from '~~/server/utils/db'
import { toRecordItem } from '~~/server/utils/catalog'

export default defineEventHandler(async (event) => {
  const uid = getRouterParam(event, 'uid')

  if (!uid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Record UID is required',
    })
  }

  const record = await db.record.findUnique({
    where: { uid },
    include: {
      artists: {
        include: {
          artist: true,
        },
      },
      played: true,
    },
  })

  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'Record not found' })
  }

  return toRecordItem(record)
})
