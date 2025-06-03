import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/middleware/auth'

const updateLayoutSchema = z.object({
  dashboardId: z.string(),
  layouts: z.object({
    lg: z.array(z.object({
      i: z.string(),
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
    })),
    md: z.array(z.object({
      i: z.string(),
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
    })),
    sm: z.array(z.object({
      i: z.string(),
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
    })),
    xs: z.array(z.object({
      i: z.string(),
      x: z.number(),
      y: z.number(),
      w: z.number(),
      h: z.number(),
    })),
  })
})

// POST /api/widgets/layout - Update widget layout
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json()
      const { dashboardId, layouts } = updateLayoutSchema.parse(body)

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

      // Update widget positions based on layout
      const updatePromises = layouts.lg.map(async (item) => {
        return prisma.widget.updateMany({
          where: { 
            id: item.i,
            dashboardId: dashboardId
          },
          data: {
            x: item.x,
            y: item.y,
            w: item.w,
            h: item.h,
          }
        })
      })

      await Promise.all(updatePromises)

      // Update dashboard layout config
      await prisma.dashboard.update({
        where: { id: dashboardId },
        data: { layoutConfig: layouts }
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors },
          { status: 400 }
        )
      }
      console.error('Update layout error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}