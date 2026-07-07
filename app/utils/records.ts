import type { RecordItem } from '~~/shared/types/catalog'

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

const hasValidPlayedDates = (record: RecordItem) => {
  return (
    record.data.played.length > 0 &&
    record.data.played.every((play) => Boolean(play.date))
  )
}

export const getLastPlayedRecords = (records: RecordItem[], limit = 3) => {
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

export const getNeverPlayedRecords = (records: RecordItem[]) => {
  return records.filter((record) => {
    return (
      record.data.played.length === 0 ||
      record.data.played.every((play) => !play.date)
    )
  })
}

export const getRandomNeverPlayedRecords = (
  records: RecordItem[],
  limit = 3
) => {
  return shuffleArray(getNeverPlayedRecords(records)).slice(0, limit)
}
