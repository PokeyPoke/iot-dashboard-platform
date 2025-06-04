import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

export const AUTH_COOKIE_NAME = 'auth-token'
export const REFRESH_COOKIE_NAME = 'refresh-token'

interface CookieOptions {
  httpOnly?: boolean
  secure?: boolean
  sameSite?: 'strict' | 'lax' | 'none'
  maxAge?: number
  path?: string
}

const getDefaultCookieOptions = (maxAge: number): CookieOptions => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge
})

export const setAuthCookies = (accessToken: string, refreshToken: string) => {
  const cookieStore = cookies()
  
  // Set access token cookie (15 minutes)
  cookieStore.set(
    AUTH_COOKIE_NAME,
    accessToken,
    getDefaultCookieOptions(15 * 60)
  )
  
  // Set refresh token cookie (7 days)
  cookieStore.set(
    REFRESH_COOKIE_NAME,
    refreshToken,
    getDefaultCookieOptions(7 * 24 * 60 * 60)
  )
}

export const getAuthCookies = () => {
  const cookieStore = cookies()
  
  return {
    accessToken: cookieStore.get(AUTH_COOKIE_NAME)?.value,
    refreshToken: cookieStore.get(REFRESH_COOKIE_NAME)?.value
  }
}

export const clearAuthCookies = () => {
  const cookieStore = cookies()
  
  cookieStore.set(AUTH_COOKIE_NAME, '', {
    ...getDefaultCookieOptions(0),
    maxAge: 0
  })
  
  cookieStore.set(REFRESH_COOKIE_NAME, '', {
    ...getDefaultCookieOptions(0),
    maxAge: 0
  })
}

export const getTokenFromRequest = (request: NextRequest): string | null => {
  // First check cookies
  const cookieToken = request.cookies.get(AUTH_COOKIE_NAME)?.value
  if (cookieToken) return cookieToken
  
  // Fallback to Authorization header for API clients
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}