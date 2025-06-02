import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getRedis } from '@/lib/redis'

export async function GET() {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`
    
    // Check Redis connection
    const redis = getRedis()
    await redis.ping()
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: 'connected',
      },
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: 'Service unavailable',
    }, { status: 503 })
  }
}