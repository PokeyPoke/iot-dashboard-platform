import { NextRequest, NextResponse } from 'next/server'

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || 'dev-internal-key-change-in-production'

export interface InternalRequest extends NextRequest {
  isInternal?: boolean
}

export async function withInternalAuth(
  request: NextRequest,
  handler: (req: InternalRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const apiKey = request.headers.get('x-internal-api-key')
  
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Missing X-Internal-API-Key header' },
      { status: 401 }
    )
  }

  if (apiKey !== INTERNAL_API_KEY) {
    console.warn('Invalid internal API key attempt:', {
      providedKey: apiKey?.substring(0, 4) + '***',
      ip: request.headers.get('x-forwarded-for') || request.ip,
      userAgent: request.headers.get('user-agent')
    })
    
    return NextResponse.json(
      { error: 'Invalid API key' },
      { status: 403 }
    )
  }

  const internalRequest = request as InternalRequest
  internalRequest.isInternal = true
  
  return await handler(internalRequest)
}

// Rate limiting for internal endpoints (separate from user endpoints)
export const internalRateLimit = {
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute for internal services
  message: 'Too many internal API requests'
}