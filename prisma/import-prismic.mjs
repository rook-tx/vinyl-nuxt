import { PrismaClient } from '@prisma/client'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const prisma = new PrismaClient()

const repository = process.env.PRISMIC_REPOSITORY || 'vinyl'
const accessToken =
  process.env.PRISMIC_ACCESS_TOKEN || process.env.PRISMIC_WRITE_TOKEN
const apiBase = `https://${repository}.cdn.prismic.io/api/v2`
const dryRun = process.argv.includes('--dry-run')
const strictRelationships = process.argv.includes('--strict-relationships')
const reportPathArg = process.argv.find((arg) => arg.startsWith('--report='))
const reportPath = reportPathArg
  ? reportPathArg.slice('--report='.length)
  : 'prisma/reports/prismic-import-latest.json'

const withAuth = (url) => {
  if (!accessToken) return url
  const delimiter = url.includes('?') ? '&' : '?'
  return `${url}${delimiter}access_token=${encodeURIComponent(accessToken)}`
}

const toPlainText = (value) => {
  if (!Array.isArray(value)) return null
  const text = value
    .map((block) =>
      block && typeof block.text === 'string' ? block.text.trim() : ''
    )
    .filter(Boolean)
    .join('\n\n')
  return text.length > 0 ? text : null
}

const parseDate = (value) => {
  if (typeof value !== 'string' || value.length === 0) return null
  const date = new Date(`${value}T00:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

async function getMasterRef() {
  const response = await fetch(withAuth(apiBase))
  if (!response.ok) {
    throw new Error(
      `Failed to read Prismic API root: ${response.status} ${response.statusText}`
    )
  }

  const data = await response.json()
  const master = data.refs?.find((ref) => ref.isMasterRef)

  if (!master?.ref) {
    throw new Error('Could not resolve Prismic master ref')
  }

  return master.ref
}

async function getAllDocumentsByType(type, ref) {
  const pageSize = 100
  let page = 1
  const documents = []

  while (true) {
    const q = encodeURIComponent(`[[at(document.type,\"${type}\")]]`)
    const url = withAuth(
      `${apiBase}/documents/search?ref=${encodeURIComponent(ref)}&q=${q}&pageSize=${pageSize}&page=${page}`
    )
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(
        `Failed fetching ${type} page ${page}: ${response.status} ${response.statusText}`
      )
    }

    const data = await response.json()
    documents.push(...(data.results || []))

    if (!data.next_page) break
    page += 1
  }

  return documents
}

function buildArtistRecordLinkIndex(artists) {
  const byRecordPrismicId = new Map()
  const byRecordUid = new Map()

  for (const artistDoc of artists) {
    const artistPrismicId = artistDoc.id
    const items = Array.isArray(artistDoc.data?.records)
      ? artistDoc.data.records
      : []

    for (const item of items) {
      const recordRef = item?.record
      if (!recordRef) continue

      if (recordRef.id) {
        const current = byRecordPrismicId.get(recordRef.id) || new Set()
        current.add(artistPrismicId)
        byRecordPrismicId.set(recordRef.id, current)
      }

      if (recordRef.uid) {
        const current = byRecordUid.get(recordRef.uid) || new Set()
        current.add(artistPrismicId)
        byRecordUid.set(recordRef.uid, current)
      }
    }
  }

  const conflicts = []

  for (const [recordPrismicId, artistIds] of byRecordPrismicId.entries()) {
    if (artistIds.size > 1) {
      conflicts.push({
        recordPrismicId,
        artists: [...artistIds],
      })
    }
  }

  for (const [recordUid, artistIds] of byRecordUid.entries()) {
    if (artistIds.size > 1) {
      conflicts.push({
        recordUid,
        artists: [...artistIds],
      })
    }
  }

  return { byRecordPrismicId, byRecordUid, conflicts }
}

async function importArtists(artists) {
  const artistMapByPrismicUid = new Map()
  const artistMapByPrismicId = new Map()
  const skipped = []
  let importedCount = 0

  for (const artistDoc of artists) {
    const uid = artistDoc.uid || slugify(artistDoc.data?.name || artistDoc.id)
    if (!uid) {
      skipped.push({
        id: artistDoc.id,
        uid: artistDoc.uid || null,
        reason: 'Missing UID and name',
      })
      continue
    }

    if (dryRun) {
      artistMapByPrismicUid.set(uid, uid)
      artistMapByPrismicId.set(artistDoc.id, uid)
      importedCount += 1
      continue
    }

    const artist = await prisma.artist.upsert({
      where: { uid },
      update: {
        name: artistDoc.data?.name || uid,
        metaTitle: artistDoc.data?.meta_title || null,
        metaDescription: artistDoc.data?.meta_description || null,
        metaImageUrl: artistDoc.data?.meta_image?.url || null,
      },
      create: {
        uid,
        name: artistDoc.data?.name || uid,
        metaTitle: artistDoc.data?.meta_title || null,
        metaDescription: artistDoc.data?.meta_description || null,
        metaImageUrl: artistDoc.data?.meta_image?.url || null,
      },
    })

    artistMapByPrismicUid.set(uid, artist.id)
    artistMapByPrismicId.set(artistDoc.id, artist.id)
    importedCount += 1
  }

  return { artistMapByPrismicUid, artistMapByPrismicId, importedCount, skipped }
}

function resolveArtistIdsForRecord(recordDoc, artistMaps, artistLinkIndex) {
  const directArtistRef = recordDoc.data?.artist
  const artistIds = new Set()
  const sourcesUsed = new Set()

  if (
    directArtistRef?.id &&
    artistMaps.artistMapByPrismicId.has(directArtistRef.id)
  ) {
    artistIds.add(artistMaps.artistMapByPrismicId.get(directArtistRef.id))
    sourcesUsed.add('record.artist.id')
    return {
      artistIds: [...artistIds],
      sourcesUsed: [...sourcesUsed],
    }
  }

  if (
    directArtistRef?.uid &&
    artistMaps.artistMapByPrismicUid.has(directArtistRef.uid)
  ) {
    artistIds.add(artistMaps.artistMapByPrismicUid.get(directArtistRef.uid))
    sourcesUsed.add('record.artist.uid')
    return {
      artistIds: [...artistIds],
      sourcesUsed: [...sourcesUsed],
    }
  }

  if (artistLinkIndex.byRecordPrismicId.has(recordDoc.id)) {
    const artistPrismicIds = artistLinkIndex.byRecordPrismicId.get(recordDoc.id)
    for (const artistPrismicId of artistPrismicIds) {
      const artistId = artistMaps.artistMapByPrismicId.get(artistPrismicId)
      if (artistId) artistIds.add(artistId)
    }
    if (artistIds.size > 0) {
      sourcesUsed.add('artist.records.id')
      return {
        artistIds: [...artistIds],
        sourcesUsed: [...sourcesUsed],
      }
    }
  }

  if (recordDoc.uid && artistLinkIndex.byRecordUid.has(recordDoc.uid)) {
    const artistPrismicIds = artistLinkIndex.byRecordUid.get(recordDoc.uid)
    for (const artistPrismicId of artistPrismicIds) {
      const artistId = artistMaps.artistMapByPrismicId.get(artistPrismicId)
      if (artistId) artistIds.add(artistId)
    }
    if (artistIds.size > 0) {
      sourcesUsed.add('artist.records.uid')
      return {
        artistIds: [...artistIds],
        sourcesUsed: [...sourcesUsed],
      }
    }
  }

  sourcesUsed.add('none')

  return {
    artistIds: [...artistIds],
    sourcesUsed: [...sourcesUsed],
  }
}

async function importRecords(records, artistMaps, artistLinkIndex) {
  let importedCount = 0
  const skipped = []
  let playedDatesWritten = 0
  const linkedBy = {
    'record.artist.id': 0,
    'record.artist.uid': 0,
    'artist.records.id': 0,
    'artist.records.uid': 0,
    none: 0,
  }

  for (const recordDoc of records) {
    const uid = recordDoc.uid || slugify(recordDoc.data?.title || recordDoc.id)
    if (!uid) {
      skipped.push({
        id: recordDoc.id,
        uid: recordDoc.uid || null,
        reason: 'Missing UID and title',
      })
      continue
    }

    const resolvedArtist = resolveArtistIdsForRecord(
      recordDoc,
      artistMaps,
      artistLinkIndex
    )
    for (const source of resolvedArtist.sourcesUsed) {
      linkedBy[source] += 1
    }

    const playedDates = Array.isArray(recordDoc.data?.played)
      ? recordDoc.data.played
          .map((entry) => parseDate(entry?.date))
          .filter((date) => date !== null)
      : []

    if (dryRun) {
      importedCount += 1
      playedDatesWritten += playedDates.length
      continue
    }

    const record = await prisma.record.upsert({
      where: { uid },
      update: {
        title: recordDoc.data?.title || uid,
        coverUrl: recordDoc.data?.cover?.url || null,
        coverAlt: recordDoc.data?.cover?.alt || null,
        recordId: recordDoc.data?.record_id || null,
        year: Number.isFinite(recordDoc.data?.year)
          ? recordDoc.data.year
          : null,
        originalYear: Number.isFinite(recordDoc.data?.original_year)
          ? recordDoc.data.original_year
          : null,
        discs: Number.isFinite(recordDoc.data?.discs)
          ? recordDoc.data.discs
          : 1,
        label: recordDoc.data?.label || null,
        notes: toPlainText(recordDoc.data?.notes),
        metaTitle: recordDoc.data?.meta_title || null,
        metaDescription: recordDoc.data?.meta_description || null,
        metaImageUrl: recordDoc.data?.meta_image?.url || null,
      },
      create: {
        uid,
        title: recordDoc.data?.title || uid,
        coverUrl: recordDoc.data?.cover?.url || null,
        coverAlt: recordDoc.data?.cover?.alt || null,
        recordId: recordDoc.data?.record_id || null,
        year: Number.isFinite(recordDoc.data?.year)
          ? recordDoc.data.year
          : null,
        originalYear: Number.isFinite(recordDoc.data?.original_year)
          ? recordDoc.data.original_year
          : null,
        discs: Number.isFinite(recordDoc.data?.discs)
          ? recordDoc.data.discs
          : 1,
        label: recordDoc.data?.label || null,
        notes: toPlainText(recordDoc.data?.notes),
        metaTitle: recordDoc.data?.meta_title || null,
        metaDescription: recordDoc.data?.meta_description || null,
        metaImageUrl: recordDoc.data?.meta_image?.url || null,
      },
    })

    await prisma.recordArtist.deleteMany({ where: { recordId: record.id } })
    if (resolvedArtist.artistIds.length > 0) {
      await prisma.recordArtist.createMany({
        data: resolvedArtist.artistIds.map((artistId) => ({
          recordId: record.id,
          artistId,
        })),
        skipDuplicates: true,
      })
    }

    await prisma.playedDate.deleteMany({ where: { recordId: record.id } })

    if (playedDates.length > 0) {
      await prisma.playedDate.createMany({
        data: playedDates.map((date) => ({
          recordId: record.id,
          date,
        })),
      })
      playedDatesWritten += playedDates.length
    }

    importedCount += 1
  }

  return { importedCount, skipped, playedDatesWritten, linkedBy }
}

async function writeReport(report) {
  const fullPath = resolve(reportPath)
  await mkdir(dirname(fullPath), { recursive: true })
  await writeFile(fullPath, `${JSON.stringify(report, null, 2)}\n`, 'utf-8')
  return fullPath
}

async function main() {
  console.log(
    `Importing from Prismic repository: ${repository}${dryRun ? ' (dry run)' : ''}${strictRelationships ? ' [strict relationships]' : ''}`
  )

  const masterRef = await getMasterRef()
  const [artists, records] = await Promise.all([
    getAllDocumentsByType('artist', masterRef),
    getAllDocumentsByType('record', masterRef),
  ])

  const artistLinkIndex = buildArtistRecordLinkIndex(artists)

  if (strictRelationships && artistLinkIndex.conflicts.length > 0) {
    const conflictReport = {
      repository,
      dryRun,
      strictRelationships,
      generatedAt: new Date().toISOString(),
      fetched: {
        artists: artists.length,
        records: records.length,
      },
      imported: {
        artists: 0,
        records: 0,
        playedDates: 0,
      },
      relationships: {
        linkedBy: null,
        artistRecordConflicts: artistLinkIndex.conflicts,
      },
      skipped: {
        artists: [],
        records: [],
      },
    }

    const writtenPath = await writeReport(conflictReport)
    console.error(`Relationship conflict report written to ${writtenPath}`)

    const conflictError = new Error(
      `Found ${artistLinkIndex.conflicts.length} artist-record relationship conflicts in Prismic`
    )
    conflictError.name = 'RelationshipConflictError'
    throw conflictError
  }

  console.log(
    `Fetched ${artists.length} artist documents and ${records.length} record documents`
  )

  const artistMaps = await importArtists(artists)
  const recordResult = await importRecords(records, artistMaps, artistLinkIndex)

  const report = {
    repository,
    dryRun,
    strictRelationships,
    generatedAt: new Date().toISOString(),
    fetched: {
      artists: artists.length,
      records: records.length,
    },
    imported: {
      artists: artistMaps.importedCount,
      records: recordResult.importedCount,
      playedDates: recordResult.playedDatesWritten,
    },
    relationships: {
      linkedBy: recordResult.linkedBy,
      artistRecordConflicts: artistLinkIndex.conflicts,
    },
    skipped: {
      artists: artistMaps.skipped,
      records: recordResult.skipped,
    },
  }

  const writtenPath = await writeReport(report)

  console.log(
    `${dryRun ? 'Dry run complete:' : 'Imported'} ${artistMaps.importedCount} artists and ${recordResult.importedCount} records${dryRun ? '' : ' into Postgres'}`
  )
  console.log(`Report written to ${writtenPath}`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
