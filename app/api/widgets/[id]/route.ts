import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/middleware/auth'

const updateWidgetSchema = z.object({
  config: z.object({}).passthrough().optional(),
  positionX: z.number().int().min(0).optional(),
  positionY: z.number().int().min(0).optional(),
  width: z.number().int().min(1).optional(),
  height: z.number().int().min(1).optional(),
})

// PUT /api/widgets/[id] - Update widget
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const widgetId = params.id
      const body = await request.json()
      const updateData = updateWidgetSchema.parse(body)

      // Verify widget ownership through dashboard
      const widget = await prisma.widget.findFirst({
        where: { 
          id: widgetId,
          dashboard: {
            userId: req.user!.userId
          }
        }
      })

      if (!widget) {
        return NextResponse.json(
          { error: 'Widget not found' },
          { status: 404 }
        )
      }

      const updatedWidget = await prisma.widget.update({
        where: { id: widgetId },
        data: updateData,
      })

      return NextResponse.json({ widget: updatedWidget })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors },
          { status: 400 }
        )
      }
      console.error('Update widget error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

// DELETE /api/widgets/[id] - Delete widget
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const widgetId = params.id

      // Verify widget ownership through dashboard
      const widget = await prisma.widget.findFirst({
        where: { 
          id: widgetId,
          dashboard: {
            userId: req.user!.userId
          }
        }
      })

      if (!widget) {
        return NextResponse.json(
          { error: 'Widget not found' },
          { status: 404 }
        )
      }

      await prisma.widget.delete({
        where: { id: widgetId },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Delete widget error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}