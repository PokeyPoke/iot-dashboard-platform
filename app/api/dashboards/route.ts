import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/middleware/auth'
import { v4 as uuidv4 } from 'uuid'

const createDashboardSchema = z.object({
  name: z.string().min(1).max(100),
  layoutConfig: z.object({}).optional(),
})

// GET /api/dashboards - Get user dashboards
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const dashboards = await prisma.dashboard.findMany({
      where: { userId: req.user!.userId },
      include: {
        widgets: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ dashboards })
  })
}

// POST /api/dashboards - Create new dashboard
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json()
      const { name, layoutConfig } = createDashboardSchema.parse(body)

      // Check dashboard limit for free tier
      if (req.user!.subscriptionTier === 'FREE') {
        const dashboardCount = await prisma.dashboard.count({
          where: { userId: req.user!.userId }
        })
        if (dashboardCount >= 3) {
          return NextResponse.json(
            { error: 'Dashboard limit reached. Upgrade to Premium for unlimited dashboards.' },
            { status: 403 }
          )
        }
      }

      const dashboard = await prisma.dashboard.create({
        data: {
          id: uuidv4(),
          userId: req.user!.userId,
          name,
          layoutConfig: layoutConfig || {
            lg: [],
            md: [],
            sm: [],
            xs: [],
          },
        },
        include: {
          widgets: true,
        },
      })

      return NextResponse.json({ dashboard })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors },
          { status: 400 }
        )
      }
      console.error('Create dashboard error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}