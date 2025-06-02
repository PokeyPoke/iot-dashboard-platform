import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    email: string
    subscriptionTier: string
  }
}

export async function withAuth(
  request: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)

  try {
    const payload = verifyAccessToken(token)
    const authenticatedRequest = request as AuthenticatedRequest
    authenticatedRequest.user = payload
    return await handler(authenticatedRequest)
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}