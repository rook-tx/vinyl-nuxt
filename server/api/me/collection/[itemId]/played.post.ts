import { createError } from 'h3'
import { requireLocalAuth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { userId } = requireLocalAuth(event)
  const itemId = getRouterParam(event, 'itemId')

  if (!itemId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Collection item ID is required',
    })
  }

  const item = await db.collectionItem.findFirst({
    where: {
      id: itemId,
      userId,
    },
    select: {
      id: true,
    },
  })

  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Collection item not found',
    })
  }

  const now = new Date()
  const today = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  )

  const play = await db.collectionItemPlayedDate.create({
    data: {
      collectionItemId: item.id,
      date: today,
    },
  })

  return {
    play: {
      id: play.id,
      date: play.date.toISOString().slice(0, 10),
      createdAt: play.createdAt.toISOString(),
    },
  }
})
