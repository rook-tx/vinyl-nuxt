import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const artist = await prisma.artist.upsert({
    where: { uid: 'miles-davis' },
    update: {},
    create: {
      uid: 'miles-davis',
      name: 'Miles Davis',
      metaTitle: 'Miles Davis',
      metaDescription: 'Artist profile for Miles Davis',
    },
  })

  const kindOfBlue = await prisma.record.upsert({
    where: { uid: 'kind-of-blue' },
    update: {},
    create: {
      uid: 'kind-of-blue',
      title: 'Kind of Blue',
      coverUrl:
        'https://upload.wikimedia.org/wikipedia/en/9/9c/MilesDavisKindofBlue.jpg',
      recordId: 'CL-1355',
      year: 1959,
      originalYear: 1959,
      label: 'Columbia',
      metaTitle: 'Kind of Blue',
      metaDescription: 'A landmark jazz record by Miles Davis.',
      played: {
        create: [{ date: new Date('2026-01-05') }],
      },
    },
  })

  const inASilentWay = await prisma.record.upsert({
    where: { uid: 'in-a-silent-way' },
    update: {},
    create: {
      uid: 'in-a-silent-way',
      title: 'In a Silent Way',
      coverUrl:
        'https://upload.wikimedia.org/wikipedia/en/5/5f/Miles_Davis_-_In_a_Silent_Way.jpg',
      recordId: 'CS 9875',
      year: 1969,
      originalYear: 1969,
      label: 'Columbia',
      metaTitle: 'In a Silent Way',
      metaDescription: 'A foundational electric jazz album by Miles Davis.',
    },
  })

  await prisma.recordArtist.upsert({
    where: {
      recordId_artistId: {
        recordId: kindOfBlue.id,
        artistId: artist.id,
      },
    },
    update: {},
    create: {
      recordId: kindOfBlue.id,
      artistId: artist.id,
    },
  })

  await prisma.recordArtist.upsert({
    where: {
      recordId_artistId: {
        recordId: inASilentWay.id,
        artistId: artist.id,
      },
    },
    update: {},
    create: {
      recordId: inASilentWay.id,
      artistId: artist.id,
    },
  })
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
