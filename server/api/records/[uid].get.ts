import { createError } from 'h3'
import { db } from '~~/server/utils/db'
import { getOptionalUserId } from '~~/server/utils/auth'
import { toRecordItem } from '~~/server/utils/catalog'
import { isMissingCollectionItemTableError } from '~~/server/utils/prisma-errors'

export default defineEventHandler(async (event) => {
  const uid = getRouterParam(event, 'uid')
  const userId = getOptionalUserId(event)

  if (!uid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Record UID is required',
    })
  }

  const baseInclude = {
    artists: {
      include: {
        artist: true,
      },
    },
  }

  let record

  try {
    record = await db.record.findUnique({
      where: { uid },
      include: {
        ...baseInclude,
        ...(userId
          ? {
              collectionItems: {
                where: { userId },
                select: {
                  id: true,
                  played: true,
                },
              },
            }
          : {}),
      },
    })
  } catch (error) {
    if (userId && isMissingCollectionItemTableError(error)) {
      record = await db.record.findUnique({
        where: { uid },
        include: baseInclude,
      })
    } else {
      throw error
    }
  }

  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'Record not found' })
  }

  return toRecordItem(record)
})
