import { requireLocalAuth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'

function toPlayDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export default defineEventHandler(async (event) => {
  const { userId } = requireLocalAuth(event)

  const items = await db.collectionItem.findMany({
    where: { userId },
    include: {
      record: {
        include: {
          artists: {
            include: {
              artist: true,
            },
          },
        },
      },
      played: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return {
    items: items.map((item) => ({
      id: item.id,
      recordId: item.recordId,
      personalNotes: item.personalNotes,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      played: item.played
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((entry) => ({ date: toPlayDate(entry.date) })),
      record: {
        id: item.record.id,
        uid: item.record.uid,
        data: {
          title: item.record.title,
          cover: item.record.coverUrl
            ? {
                url: item.record.coverUrl,
                alt: item.record.coverAlt,
              }
            : null,
          artists: item.record.artists.map((link) => ({
            id: link.artist.id,
            uid: link.artist.uid,
            data: {
              name: link.artist.name,
            },
          })),
          record_id: item.record.recordId,
          played: item.played
            .sort((a, b) => a.date.getTime() - b.date.getTime())
            .map((entry) => ({ date: toPlayDate(entry.date) })),
          discs: item.record.discs,
          label: item.record.label,
          year: item.record.year,
          original_year: item.record.originalYear,
          notes: item.record.notes,
        },
      },
    })),
  }
})
