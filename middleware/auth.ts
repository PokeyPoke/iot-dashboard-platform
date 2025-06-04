import { NextRequest, NextResponse } from 'next/server'
import { verifyAccessToken } from '@/lib/auth'
import { getTokenFromRequest } from '@/lib/cookies'

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
  // Get token from cookies or Authorization header
  const token = getTokenFromRequest(request)
  
  if (!token) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

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