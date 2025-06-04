import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health check - just return OK to indicate service is running
    // Database and Redis checks can be added later once service is stable
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Service is running',
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