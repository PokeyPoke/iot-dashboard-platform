import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/middleware/auth'
import { v4 as uuidv4 } from 'uuid'

const createWidgetSchema = z.object({
  dashboardId: z.string(),
  type: z.enum(['STOCK', 'WEATHER', 'CUSTOM']),
  config: z.object({}).passthrough(),
  x: z.number().int().min(0),
  y: z.number().int().min(0),
  w: z.number().int().min(1),
  h: z.number().int().min(1),
})

const updateWidgetSchema = z.object({
  config: z.object({}).passthrough().optional(),
  x: z.number().int().min(0).optional(),
  y: z.number().int().min(0).optional(),
  w: z.number().int().min(1).optional(),
  h: z.number().int().min(1).optional(),
})

// GET /api/widgets - Get widgets for a dashboard
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const { searchParams } = new URL(request.url)
    const dashboardId = searchParams.get('dashboardId')

    if (!dashboardId) {
      return NextResponse.json(
        { error: 'Dashboard ID is required' },
        { status: 400 }
      )
    }

    // Verify dashboard ownership
    const dashboard = await prisma.dashboard.findFirst({
      where: { 
        id: dashboardId,
        userId: req.user!.userId 
      }
    })

    if (!dashboard) {
      return NextResponse.json(
        { error: 'Dashboard not found' },
        { status: 404 }
      )
    }

    const widgets = await prisma.widget.findMany({
      where: { dashboardId },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json({ widgets })
  })
}

// POST /api/widgets - Create new widget
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json()
      const { dashboardId, type, config, x, y, w, h } = createWidgetSchema.parse(body)

      // Verify dashboard ownership
      const dashboard = await prisma.dashboard.findFirst({
        where: { 
          id: dashboardId,
          userId: req.user!.userId 
        }
      })

      if (!dashboard) {
        return NextResponse.json(
          { error: 'Dashboard not found' },
          { status: 404 }
        )
      }

      // Check widget limit for free tier
      if (req.user!.subscriptionTier === 'FREE') {
        const widgetCount = await prisma.widget.count({
          where: { dashboardId }
        })
        if (widgetCount >= 10) {
          return NextResponse.json(
            { error: 'Widget limit reached. Upgrade to Premium for unlimited widgets.' },
            { status: 403 }
          )
        }
      }

      const widget = await prisma.widget.create({
        data: {
          id: uuidv4(),
          dashboardId,
          widgetType: type,
          config,
          positionX: x,
          positionY: y,
          width: w,
          height: h,
        },
      })

      return NextResponse.json({ widget })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors },
          { status: 400 }
        )
      }
      console.error('Create widget error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}