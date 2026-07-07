import { describe, expect, it } from 'vitest'
import {
  getLastPlayedRecords,
  getNeverPlayedRecords,
  getRandomNeverPlayedRecords,
} from '../app/utils/records'
import type { RecordItem } from '../shared/types/catalog'

const makeRecord = (
  uid: string,
  playedDates: Array<string | null>
): RecordItem => ({
  id: uid,
  uid,
  data: {
    title: uid,
    cover: null,
    artist: null,
    artists: [],
    record_id: null,
    played: playedDates.map((date) => ({ date })),
    discs: 1,
    label: null,
    year: null,
    original_year: null,
    notes: null,
    meta_title: null,
    meta_description: null,
    meta_image: null,
  },
})

describe('record utility selectors', () => {
  it('returns last played records sorted by most recent play date', () => {
    const records = [
      makeRecord('a', ['2026-01-05']),
      makeRecord('b', ['2026-02-01']),
      makeRecord('c', [null]),
      makeRecord('d', ['2026-01-10', '2026-03-01']),
    ]

    const result = getLastPlayedRecords(records, 2)

    expect(result.map((record) => record.uid)).toEqual(['d', 'b'])
  })

  it('detects never played records correctly', () => {
    const records = [
      makeRecord('a', []),
      makeRecord('b', [null, null]),
      makeRecord('c', ['2026-01-01']),
    ]

    const result = getNeverPlayedRecords(records)

    expect(result.map((record) => record.uid)).toEqual(['a', 'b'])
  })

  it('returns only records that are never played in random subset helper', () => {
    const records = [
      makeRecord('a', []),
      makeRecord('b', [null]),
      makeRecord('c', ['2026-01-01']),
    ]

    const result = getRandomNeverPlayedRecords(records, 2)

    expect(result).toHaveLength(2)
    expect(result.every((record) => record.uid === 'a' || record.uid === 'b')).toBe(true)
  })
})
