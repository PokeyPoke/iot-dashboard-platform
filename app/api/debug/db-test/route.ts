import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    await prisma.$queryRaw`SELECT 1 as test`
    console.log('Basic connection test passed')
    
    // Test if User table exists
    const userCount = await prisma.user.count()
    console.log('User table exists, count:', userCount)
    
    // Test if other tables exist
    const dashboardCount = await prisma.dashboard.count()
    console.log('Dashboard table exists, count:', dashboardCount)
    
    return NextResponse.json({
      status: 'success',
      message: 'Database connection and tables working',
      counts: {
        users: userCount,
        dashboards: dashboardCount
      }
    })
  } catch (error) {
    console.error('Database test failed:', error)
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.toString() : String(error)
    }, { status: 500 })
  }
}