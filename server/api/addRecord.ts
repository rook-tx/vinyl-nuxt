import { createError } from 'h3'
import { requireLocalAuth } from '~~/server/utils/auth'
import { db } from '~~/server/utils/db'
import { slugify, toRecordItem } from '~~/server/utils/catalog'

type AddRecordPayload = {
  title?: string
  artist_ids?: string[]
  artist_uids?: string[]
  artist_names?: string[]
  artist_id?: string
  artist_uid?: string
  artist_name?: string
  record_id?: string
  year?: number
  original_year?: number
  discs?: number
  label?: string
  notes?: string
  cover_url?: string
}

export default defineEventHandler(async (event) => {
  const { userId } = requireLocalAuth(event)

  const body = (await readBody(event).catch(() => ({}))) as AddRecordPayload

  if (!body.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Title is required' })
  }

  const artistIds = new Set<string>()

  const artistIdsInput = [
    ...(Array.isArray(body.artist_ids) ? body.artist_ids : []),
    ...(body.artist_id ? [body.artist_id] : []),
  ]

  for (const rawId of artistIdsInput) {
    const id = rawId?.trim()
    if (!id) continue

    const artist = await db.artist.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!artist) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid artist_id: ${id}`,
      })
    }

    artistIds.add(artist.id)
  }

  const artistUidsInput = [
    ...(Array.isArray(body.artist_uids) ? body.artist_uids : []),
    ...(body.artist_uid ? [body.artist_uid] : []),
  ]

  for (const rawUid of artistUidsInput) {
    const uid = rawUid?.trim()
    if (!uid) continue

    const artist = await db.artist.findUnique({
      where: { uid },
      select: { id: true },
    })

    if (!artist) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid artist_uid: ${uid}`,
      })
    }

    artistIds.add(artist.id)
  }

  const artistNamesInput = [
    ...(Array.isArray(body.artist_names) ? body.artist_names : []),
    ...(body.artist_name ? [body.artist_name] : []),
  ]

  for (const rawName of artistNamesInput) {
    const artistName = rawName?.trim()
    if (!artistName) continue

    const artist = await db.artist.upsert({
      where: { uid: slugify(artistName) },
      update: { name: artistName },
      create: {
        uid: slugify(artistName),
        name: artistName,
      },
    })
    artistIds.add(artist.id)
  }

  const created = await db.record.create({
    data: {
      uid: slugify(body.title),
      title: body.title.trim(),
      recordId: body.record_id ?? null,
      year: body.year ?? null,
      originalYear: body.original_year ?? null,
      discs: body.discs ?? 1,
      label: body.label ?? null,
      notes: body.notes ?? null,
      coverUrl: body.cover_url ?? null,
    },
  })

  if (artistIds.size > 0) {
    await db.recordArtist.createMany({
      data: [...artistIds].map((artistId) => ({
        recordId: created.id,
        artistId,
      })),
      skipDuplicates: true,
    })
  }

  const createdWithRelations = await db.record.findUnique({
    where: { id: created.id },
    include: {
      artists: {
        include: {
          artist: true,
        },
      },
      collectionItems: {
        where: { userId },
        select: {
          id: true,
          played: true,
        },
      },
    },
  })

  if (!createdWithRelations) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Record not found after create',
    })
  }

  return toRecordItem(createdWithRelations)
})
