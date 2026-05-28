import { isFilled } from '@prismicio/client'

import type { RecordDocument } from '~~/prismicio-types'

export const shuffleArray = <T>(items: T[]) => {
  const shuffled = [...items]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const current = shuffled[i]!
    shuffled[i] = shuffled[j]!
    shuffled[j] = current
  }

  return shuffled
}

const hasValidPlayedDates = (record: RecordDocument<string>) => {
  return (
    isFilled.group(record.data.played) &&
    record.data.played.every((play) => isFilled.date(play.date))
  )
}

export const getLastPlayedRecords = (
  records: RecordDocument<string>[],
  limit = 3
) => {
  return records
    .filter(hasValidPlayedDates)
    .sort((a, b) => {
      const aDate = a.data.played[a.data.played.length - 1]?.date
      const bDate = b.data.played[b.data.played.length - 1]?.date

      if (!aDate || !bDate) return 0

      return bDate.localeCompare(aDate)
    })
    .slice(0, limit)
}

export const getNeverPlayedRecords = (records: RecordDocument<string>[]) => {
  return records.filter((record) => {
    return (
      !isFilled.group(record.data.played) ||
      record.data.played.every((play) => !isFilled.date(play.date))
    )
  })
}

export const getRandomNeverPlayedRecords = (
  records: RecordDocument<string>[],
  limit = 3
) => {
  return shuffleArray(getNeverPlayedRecords(records)).slice(0, limit)
}
