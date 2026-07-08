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
    select: { id: true },
  })

  if (!item) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Collection item not found',
    })
  }

  await db.collectionItem.delete({ where: { id: item.id } })

  return {
    deleted: true,
  }
})
