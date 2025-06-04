import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateAccessToken, generateRefreshToken } from '@/lib/auth'
import { setAuthCookiesInResponse } from '@/lib/cookies'
import { authRateLimit } from '@/middleware/rateLimit'
import { v4 as uuidv4 } from 'uuid'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export async function POST(request: NextRequest) {
  // Apply rate limiting
  return authRateLimit(request, async () => {
    try {
      console.log('Login attempt started')
      const body = await request.json()
      console.log('Request body parsed:', { email: body.email, hasPassword: !!body.password })
      const { email, password } = loginSchema.parse(body)
      console.log('Schema validation passed')

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
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
        // but encourage clients to use cookies
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
      console.error('Login error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}