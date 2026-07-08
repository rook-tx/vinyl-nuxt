import { db } from '~~/server/utils/db'
import { getOptionalUserId } from '~~/server/utils/auth'
import { toRecordItem } from '~~/server/utils/catalog'
import { isMissingCollectionItemTableError } from '~~/server/utils/prisma-errors'

export default defineEventHandler(async (event) => {
  const userId = getOptionalUserId(event)

  const baseInclude = {
    artists: {
      include: {
        artist: true,
      },
    },
  }

  let records

  try {
    records = await db.record.findMany({
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
      orderBy: {
        title: 'asc',
      },
    })
  } catch (error) {
    if (userId && isMissingCollectionItemTableError(error)) {
      records = await db.record.findMany({
        include: baseInclude,
        orderBy: {
          title: 'asc',
        },
      })
    } else {
      throw error
    }
  }

  return records.map(toRecordItem)
})
