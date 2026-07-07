import { describe, expect, it } from 'vitest'
import { toArtistItem, toRecordItem } from '../server/utils/catalog'

describe('catalog serializers', () => {
  it('serializes record artists and keeps legacy first artist field', () => {
    const record = {
      id: 'record-1',
      uid: 'record-one',
      title: 'Record One',
      coverUrl: 'https://example.com/cover.jpg',
      coverAlt: 'Cover',
      recordId: 'R-1',
      year: 2001,
      originalYear: 2000,
      discs: 2,
      label: 'Test Label',
      notes: 'Some notes',
      metaTitle: 'Meta title',
      metaDescription: 'Meta description',
      metaImageUrl: 'https://example.com/meta.jpg',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      artists: [
        {
          artistId: 'artist-1',
          recordId: 'record-1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          artist: {
            id: 'artist-1',
            uid: 'artist-a',
            name: 'Artist A',
            metaTitle: null,
            metaDescription: null,
            metaImageUrl: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        },
        {
          artistId: 'artist-2',
          recordId: 'record-1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          artist: {
            id: 'artist-2',
            uid: 'artist-b',
            name: 'Artist B',
            metaTitle: null,
            metaDescription: null,
            metaImageUrl: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        },
      ],
      played: [
        {
          id: 'p2',
          recordId: 'record-1',
          date: new Date('2026-01-05T00:00:00.000Z'),
          createdAt: new Date('2026-01-05T00:00:00.000Z'),
        },
        {
          id: 'p1',
          recordId: 'record-1',
          date: new Date('2026-01-04T00:00:00.000Z'),
          createdAt: new Date('2026-01-04T00:00:00.000Z'),
        },
      ],
    }

    const item = toRecordItem(record)

    expect(item.data.artists).toHaveLength(2)
    expect(item.data.artist?.uid).toBe('artist-a')
    expect(item.data.played.map((p) => p.date)).toEqual([
      '2026-01-04',
      '2026-01-05',
    ])
  })

  it('serializes artist records sorted by title', () => {
    const artist = {
      id: 'artist-1',
      uid: 'artist-a',
      name: 'Artist A',
      metaTitle: null,
      metaDescription: null,
      metaImageUrl: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
      records: [
        {
          recordId: 'r2',
          artistId: 'artist-1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          record: {
            id: 'r2',
            uid: 'zeta',
            title: 'Zeta',
            coverUrl: null,
            coverAlt: null,
            recordId: null,
            year: null,
            originalYear: null,
            discs: 1,
            label: null,
            notes: null,
            metaTitle: null,
            metaDescription: null,
            metaImageUrl: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        },
        {
          recordId: 'r1',
          artistId: 'artist-1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          record: {
            id: 'r1',
            uid: 'alpha',
            title: 'Alpha',
            coverUrl: null,
            coverAlt: null,
            recordId: null,
            year: null,
            originalYear: null,
            discs: 1,
            label: null,
            notes: null,
            metaTitle: null,
            metaDescription: null,
            metaImageUrl: null,
            createdAt: new Date('2026-01-01T00:00:00.000Z'),
            updatedAt: new Date('2026-01-01T00:00:00.000Z'),
          },
        },
      ],
    }

    const item = toArtistItem(artist)

    expect(item.data.records.map((entry) => entry.record.data.title)).toEqual([
      'Alpha',
      'Zeta',
    ])
  })
})
