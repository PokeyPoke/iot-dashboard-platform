import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookies, getAuthCookies } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = getAuthCookies()
    
    // Remove refresh token from database if it exists
    if (refreshToken) {
      await prisma.session.deleteMany({
        where: { refreshToken }
      })
    }
    
    // Clear auth cookies
    clearAuthCookies()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear cookies even if database operation fails
    clearAuthCookies()
    return NextResponse.json({ success: true })
  }
}