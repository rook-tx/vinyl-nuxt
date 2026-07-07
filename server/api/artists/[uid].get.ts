import { createError } from 'h3'
import { db } from '~~/server/utils/db'
import { toArtistItem } from '~~/server/utils/catalog'

export default defineEventHandler(async (event) => {
  const uid = getRouterParam(event, 'uid')

  if (!uid) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Artist UID is required',
    })
  }

  const artist = await db.artist.findUnique({
    where: { uid },
    include: {
      records: {
        include: {
          record: true,
        },
      },
    },
  })

  if (!artist) {
    throw createError({ statusCode: 404, statusMessage: 'Artist not found' })
  }

  return toArtistItem(artist)
})
