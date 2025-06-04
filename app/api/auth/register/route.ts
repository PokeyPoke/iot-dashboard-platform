import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateAccessToken, generateRefreshToken } from '@/lib/auth'
import { setAuthCookiesInResponse } from '@/lib/cookies'
import { authRateLimit } from '@/middleware/rateLimit'
import { v4 as uuidv4 } from 'uuid'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  username: z.string().min(3).optional(),
})

export async function POST(request: NextRequest) {
  // Apply rate limiting
  return authRateLimit(request, async () => {
    try {
      console.log('Register attempt started')
      const body = await request.json()
      console.log('Request body parsed:', { email: body.email, hasPassword: !!body.password, username: body.username })
      const { email, password, username } = registerSchema.parse(body)
      console.log('Schema validation passed')

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username: username || undefined }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Create user
    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        username,
        passwordHash,
      }
    })

    // Create default dashboard
    await prisma.dashboard.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        name: 'My Dashboard',
        isDefault: true,
        layoutConfig: {
          lg: [],
          md: [],
          sm: [],
          xs: [],
        }
      }
    })

    // Generate tokens
    const payload = {
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier,
    }
    const accessToken = generateAccessToken(payload)
    const refreshToken = generateRefreshToken(payload)

    // Store refresh token
    await prisma.session.create({
      data: {
        id: uuidv4(),
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }
      })

      // Create response and set secure httpOnly cookies
      const response = NextResponse.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          subscriptionTier: user.subscriptionTier,
        },
        // Still include tokens in response for backward compatibility
        accessToken,
        refreshToken,
      })

      return setAuthCookiesInResponse(response, accessToken, refreshToken)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors },
          { status: 400 }
        )
      }
      console.error('Registration error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}