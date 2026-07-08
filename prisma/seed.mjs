import { PrismaClient } from '@prisma/client'
import { randomBytes, scryptSync } from 'node:crypto'

const prisma = new PrismaClient()
const SCRYPT_KEY_LENGTH = 64

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex')
  return `scrypt$${salt}$${hash}`
}

async function main() {
  await prisma.user.upsert({
    where: { email: 'twcorb@gmail.com' },
    update: {
      displayName: 'tom',
      passwordHash: hashPassword('collection'),
    },
    create: {
      displayName: 'tom',
      email: 'twcorb@gmail.com',
      passwordHash: hashPassword('collection'),
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
