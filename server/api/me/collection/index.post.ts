import { createError } from 'h3'
import { requireLocalAuth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const { userId } = requireLocalAuth(event)

  const body = (await readBody(event).catch(() => ({}))) as {
    recordId?: string
    personalNotes?: string
  }

  const recordId = typeof body.recordId === 'string' ? body.recordId.trim() : ''
  const personalNotes =
    typeof body.personalNotes === 'string' &&
    body.personalNotes.trim().length > 0
      ? body.personalNotes.trim()
      : null

  if (!recordId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'recordId is required',
    })
  }

  const record = await db.record.findUnique({
    where: { id: recordId },
    select: { id: true },
  })

  if (!record) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Record not found',
    })
  }

  const item = await db.collectionItem.create({
    data: {
      userId,
      recordId,
      personalNotes,
    },
  })

  return {
    item: {
      id: item.id,
      recordId: item.recordId,
      personalNotes: item.personalNotes,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    },
  }
})
