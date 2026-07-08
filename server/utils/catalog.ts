import type {
  Artist,
  CollectionItem,
  CollectionItemPlayedDate,
  Record,
  RecordArtist,
} from '@prisma/client'
import type { ArtistItem, RecordItem } from '~~/shared/types/catalog'

type RecordWithRelations = Record & {
  artists: Array<RecordArtist & { artist: Artist }>
  collectionItems?: Array<
    Pick<CollectionItem, 'id'> & { played: CollectionItemPlayedDate[] }
  >
}

type ArtistWithRecords = Artist & {
  records: Array<RecordArtist & { record: Record }>
}

export const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export const toRecordItem = (record: RecordWithRelations): RecordItem => {
  const playedDates = (record.collectionItems ?? [])
    .flatMap((item) => item.played)
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  const artists = record.artists.map((link) => ({
    id: link.artist.id,
    uid: link.artist.uid,
    data: {
      name: link.artist.name,
    },
  }))

  return {
    id: record.id,
    uid: record.uid,
    data: {
      title: record.title,
      cover: record.coverUrl
        ? {
            url: record.coverUrl,
            alt: record.coverAlt,
          }
        : null,
      artists,
      record_id: record.recordId,
      played: playedDates.map((play) => ({
        date: play.date.toISOString().slice(0, 10),
      })),
      discs: record.discs,
      label: record.label,
      year: record.year,
      original_year: record.originalYear,
      notes: record.notes,
    },
  }
}

export const toArtistItem = (artist: ArtistWithRecords): ArtistItem => {
  return {
    id: artist.id,
    uid: artist.uid,
    data: {
      name: artist.name,
      records: [...artist.records]
        .sort((a, b) => a.record.title.localeCompare(b.record.title))
        .map((record) => ({
          record: {
            id: record.record.id,
            uid: record.record.uid,
            data: {
              title: record.record.title,
              cover: record.record.coverUrl
                ? {
                    url: record.record.coverUrl,
                    alt: record.record.coverAlt,
                  }
                : null,
            },
          },
        })),
    },
  }
}
