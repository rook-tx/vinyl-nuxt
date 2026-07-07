import type { Artist, PlayedDate, Record, RecordArtist } from '@prisma/client'
import type { ArtistItem, RecordItem } from '~~/shared/types/catalog'

type RecordWithRelations = Record & {
  artists: Array<RecordArtist & { artist: Artist }>
  played: PlayedDate[]
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
      artist: artists[0] ?? null,
      artists,
      record_id: record.recordId,
      played: record.played
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((play) => ({
          date: play.date.toISOString().slice(0, 10),
        })),
      discs: record.discs,
      label: record.label,
      year: record.year,
      original_year: record.originalYear,
      notes: record.notes,
      meta_title: record.metaTitle,
      meta_description: record.metaDescription,
      meta_image: record.metaImageUrl
        ? {
            url: record.metaImageUrl,
          }
        : null,
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
      meta_title: artist.metaTitle,
      meta_description: artist.metaDescription,
      meta_image: artist.metaImageUrl
        ? {
            url: artist.metaImageUrl,
          }
        : null,
    },
  }
}
