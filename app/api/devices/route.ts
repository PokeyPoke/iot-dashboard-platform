import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/middleware/auth'
import { v4 as uuidv4 } from 'uuid'

const createDeviceSchema = z.object({
  deviceName: z.string().min(1).max(100),
  deviceType: z.enum(['ESP32_DISPLAY', 'ARDUINO', 'RASPBERRY_PI', 'CUSTOM']),
  deviceConfig: z.object({}).optional(),
})

// GET /api/devices - Get user devices
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const devices = await prisma.device.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ devices })
  })
}

// POST /api/devices - Create new device
export async function POST(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    try {
      const body = await request.json()
      const { deviceName, deviceType, deviceConfig } = createDeviceSchema.parse(body)

      // Check device limit for free tier
      if (req.user!.subscriptionTier === 'FREE') {
        const deviceCount = await prisma.device.count({
          where: { userId: req.user!.userId }
        })
        if (deviceCount >= 2) {
          return NextResponse.json(
            { error: 'Device limit reached. Upgrade to Premium for unlimited devices.' },
            { status: 403 }
          )
        }
      }

      const apiToken = uuidv4()
      const mqttTopic = `dashboard/${req.user!.userId}/${uuidv4()}`

      const device = await prisma.device.create({
        data: {
          id: uuidv4(),
          userId: req.user!.userId,
          deviceName,
          deviceType,
          apiToken,
          mqttTopic,
          deviceConfig: deviceConfig || {},
        },
      })

      return NextResponse.json({ 
        device,
        pairingCode: generatePairingCode(device.apiToken),
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors },
          { status: 400 }
        )
      }
      console.error('Create device error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}

function generatePairingCode(apiToken: string): string {
  // Generate a short pairing code for easy device setup
  const code = apiToken.substring(0, 8).toUpperCase()
  return `${code.substring(0, 4)}-${code.substring(4)}`
}