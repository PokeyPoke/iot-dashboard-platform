import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

console.log('🗄️ Initializing Prisma client...')
console.log('Database URL configured:', !!process.env.DATABASE_URL)

let prismaClient: PrismaClient

try {
  prismaClient = global.prisma || new PrismaClient({
    log: ['info', 'warn', 'error'],
  })
  console.log('✅ Prisma client created successfully')
} catch (error) {
  console.error('❌ Failed to create Prisma client:', error)
  throw error
}

export const prisma = prismaClient

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
  console.log('🔧 Development mode: Prisma client cached globally')
}