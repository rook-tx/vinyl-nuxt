import { db } from '~~/server/utils/db'
import { toArtistItem } from '~~/server/utils/catalog'

export default defineEventHandler(async () => {
  const artists = await db.artist.findMany({
    include: {
      records: {
        include: {
          record: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  })

  return artists.map(toArtistItem)
})
