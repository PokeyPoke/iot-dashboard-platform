import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCachedData, setCachedData } from '@/lib/redis'
import { fetchStockData, fetchWeatherData, fetchCryptoData } from '@/services/dataFetcher'

export async function GET(
  request: NextRequest,
  { params }: { params: { deviceToken: string } }
) {
  try {
    const { deviceToken } = params

    // Find device
    const device = await prisma.device.findUnique({
      where: { apiToken: deviceToken },
      include: {
        user: {
          include: {
            dashboards: {
              where: { isDefault: true },
              include: {
                widgets: {
                  where: { isActive: true },
                },
              },
            },
          },
        },
      },
    })

    if (!device || !device.isActive) {
      return NextResponse.json(
        { error: 'Device not found or inactive' },
        { status: 404 }
      )
    }

    // Update last seen
    await prisma.device.update({
      where: { id: device.id },
      data: { lastSeen: new Date() },
    })

    const dashboard = device.user.dashboards[0]
    if (!dashboard) {
      return NextResponse.json(
        { error: 'No default dashboard found' },
        { status: 404 }
      )
    }

    // Fetch widget data
    const widgetData = await Promise.all(
      dashboard.widgets.map(async (widget) => {
        try {
          let data = null
          
          switch (widget.widgetType) {
            case 'STOCK':
              data = await fetchStockData((widget.config as any)?.symbol || 'AAPL')
              break
            case 'WEATHER':
              data = await fetchWeatherData(
                (widget.config as any)?.location || 'New York',
                (widget.config as any)?.units || 'metric'
              )
              break
            case 'CRYPTO':
              data = await fetchCryptoData(
                (widget.config as any)?.coin || 'bitcoin',
                (widget.config as any)?.currency || 'USD'
              )
              break
          }

          return {
            id: widget.id,
            type: widget.widgetType,
            data: formatForDevice(data, device.deviceType),
          }
        } catch (error) {
          console.error(`Error fetching data for widget ${widget.id}:`, error)
          return {
            id: widget.id,
            type: widget.widgetType,
            error: 'Failed to fetch data',
          }
        }
      })
    )

    // Format response for IoT device
    const response = {
      timestamp: Date.now(),
      dashboardId: dashboard.id,
      widgets: widgetData,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('IoT dashboard error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function formatForDevice(data: any, deviceType: string): any {
  if (!data) return null

  switch (deviceType) {
    case 'ESP32_DISPLAY':
      // Minimal format for small displays
      return {
        v: data.price || data.temperature || data.value,
        c: data.change || data.changePercent || data.change24h,
        u: data.symbol || data.location || data.coin,
      }
    default:
      return data
  }
}