import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { withAuth, AuthenticatedRequest } from '@/middleware/auth'

// GET /api/iot/device-data?deviceToken=xxx
export async function GET(request: NextRequest) {
  return withAuth(request, async (req: AuthenticatedRequest) => {
    const { searchParams } = new URL(request.url)
    const deviceToken = searchParams.get('deviceToken')

    if (!deviceToken) {
      return NextResponse.json(
        { error: 'Device token is required' },
        { status: 400 }
      )
    }

    try {
      // Find the device to verify ownership
      const device = await prisma.device.findFirst({
        where: { 
          apiToken: deviceToken,
          userId: req.user!.userId 
        }
      })

      if (!device) {
        return NextResponse.json(
          { error: 'Device not found or access denied' },
          { status: 404 }
        )
      }

      // For now, return mock data. In a real implementation, this would:
      // 1. Query your time-series database (InfluxDB, TimescaleDB, etc.)
      // 2. Or query a real-time data store (Redis)
      // 3. Or fetch from MQTT topic history
      
      const mockData = {
        timestamp: new Date().toISOString(),
        deviceId: device.id,
        deviceName: device.deviceName,
        data: {
          temperature: 23.5 + Math.random() * 10,
          humidity: 55 + Math.random() * 20,
          pressure: 1013 + Math.random() * 50,
          status: Math.random() > 0.1 ? 'online' : 'offline',
          sensors: {
            temperature: 24.1 + Math.random() * 8,
            humidity: 58 + Math.random() * 15,
            motion: Math.random() > 0.7,
            light: Math.floor(Math.random() * 1000)
          },
          battery: 85 + Math.random() * 15
        },
        // Historical data for charts (last 20 data points)
        history: Array.from({ length: 20 }, (_, i) => ({
          timestamp: new Date(Date.now() - (19 - i) * 60000).toISOString(),
          temperature: 23 + Math.sin(i * 0.3) * 5 + Math.random() * 2,
          humidity: 60 + Math.sin(i * 0.2) * 15 + Math.random() * 5,
          pressure: 1013 + Math.sin(i * 0.1) * 20 + Math.random() * 10
        }))
      }

      return NextResponse.json(mockData)
    } catch (error) {
      console.error('Device data fetch error:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  })
}