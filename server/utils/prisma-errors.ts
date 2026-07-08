import { Prisma } from '@prisma/client'

export function isMissingCollectionItemTableError(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
    return false
  }

  if (error.code !== 'P2021') {
    return false
  }

  const table =
    typeof error.meta?.table === 'string'
      ? error.meta.table
      : typeof error.meta?.modelName === 'string'
        ? error.meta.modelName
        : ''

  return table.toLowerCase().includes('collectionitem')
}