import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/index.js'
import { PrismaNeon } from '@prisma/adapter-neon'

let prismaInstance: PrismaClient | null = null

export function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set in process.env')
    }
    const adapter = new PrismaNeon({ connectionString })
    prismaInstance = new PrismaClient({ adapter })
  }
  return prismaInstance
}

// Proxy wrapper so `prisma.subject.findMany()` works seamlessly anywhere
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma() as any
    const val = client[prop]
    return typeof val === 'function' ? val.bind(client) : val
  },
})

export default prisma
