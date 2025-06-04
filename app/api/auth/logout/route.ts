import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookiesInResponse, REFRESH_COOKIE_NAME } from '@/lib/cookies'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get(REFRESH_COOKIE_NAME)?.value
    
    // Remove refresh token from database if it exists
    if (refreshToken) {
      await prisma.session.deleteMany({
        where: { refreshToken }
      })
    }
    
    // Create response and clear auth cookies
    const response = NextResponse.json({ success: true })
    return clearAuthCookiesInResponse(response)
  } catch (error) {
    console.error('Logout error:', error)
    // Still clear cookies even if database operation fails
    const response = NextResponse.json({ success: true })
    return clearAuthCookiesInResponse(response)
  }
}