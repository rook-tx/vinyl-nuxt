import { createError } from 'h3'
import { requireLocalAuth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { toRecordItem } from '~~/server/utils/catalog'

export default defineEventHandler(async (event) => {
  const { userId } = requireLocalAuth(event)

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

  const collectionItem = await db.collectionItem.findFirst({
    where: {
      userId,
      recordId: record.id,
    },
    orderBy: {
      createdAt: 'desc',
    },
    select: {
      id: true,
    },
  })

  if (!collectionItem) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Add this record to your collection before marking played',
    })
  }

  const now = new Date()
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )

  await db.collectionItemPlayedDate.create({
    data: {
      collectionItemId: collectionItem.id,
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
      collectionItems: {
        where: { userId },
        select: {
          id: true,
          played: true,
        },
      },
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
