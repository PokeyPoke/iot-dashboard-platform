import { NextRequest, NextResponse } from 'next/server'

interface RateLimitData {
  count: number
  resetTime: number
}

// In-memory store for rate limiting (consider using Redis in production)
const rateLimitMap = new Map<string, RateLimitData>()

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now()
  Array.from(rateLimitMap.entries()).forEach(([key, data]) => {
    if (now > data.resetTime) {
      rateLimitMap.delete(key)
    }
  })
}, 60000) // Clean up every minute

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  max: number // Maximum number of requests per window
  message?: string
  keyGenerator?: (req: NextRequest) => string
}

export function rateLimit(options: RateLimitOptions) {
  return async (request: NextRequest, handler: () => Promise<NextResponse>) => {
    const key = options.keyGenerator?.(request) || 
                request.headers.get('x-forwarded-for') || 
                request.ip || 
                'anonymous'
    
    const now = Date.now()
    const data = rateLimitMap.get(key) || { count: 0, resetTime: now + options.windowMs }
    
    // Reset if window has passed
    if (now > data.resetTime) {
      data.count = 0
      data.resetTime = now + options.windowMs
    }
    
    data.count++
    rateLimitMap.set(key, data)
    
    // Check if limit exceeded
    if (data.count > options.max) {
      return NextResponse.json(
        { error: options.message || 'Too many requests, please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((data.resetTime - now) / 1000)),
            'X-RateLimit-Limit': String(options.max),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(data.resetTime).toISOString()
          }
        }
      )
    }
    
    // Add rate limit headers to response
    const response = await handler()
    response.headers.set('X-RateLimit-Limit', String(options.max))
    response.headers.set('X-RateLimit-Remaining', String(options.max - data.count))
    response.headers.set('X-RateLimit-Reset', new Date(data.resetTime).toISOString())
    
    return response
  }
}

// Preset configurations
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later.'
})

export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: 'API rate limit exceeded.'
})