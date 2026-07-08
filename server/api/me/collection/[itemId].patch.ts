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

  const body = (await readBody(event).catch(() => ({}))) as {
    personalNotes?: string | null
  }

  const personalNotes =
    typeof body.personalNotes === 'string'
      ? body.personalNotes.trim() || null
      : body.personalNotes === null
        ? null
        : undefined

  if (personalNotes === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'personalNotes is required',
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

  const updated = await db.collectionItem.update({
    where: { id: item.id },
    data: { personalNotes },
  })

  return {
    item: {
      id: updated.id,
      recordId: updated.recordId,
      personalNotes: updated.personalNotes,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    },
  }
})
