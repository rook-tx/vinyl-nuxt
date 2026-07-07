import { createError } from 'h3'
import { requireLocalAuth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { toRecordItem } from '~~/server/utils/catalog'

export default defineEventHandler(async (event) => {
  requireLocalAuth(event)

  const uid = getRouterParam(event, 'uid')

  if (!uid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Record UID is required',
    })
  }

  const record = await db.record.findUnique({
    where: { uid },
    select: { id: true },
  })

  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'Record not found' })
  }

  const now = new Date()
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )

  await db.playedDate.create({
    data: {
      recordId: record.id,
      date: today,
    },
  })

  const updatedRecord = await db.record.findUnique({
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

  if (!updatedRecord) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Record not found after update',
    })
  }

  return toRecordItem(updatedRecord)
})
