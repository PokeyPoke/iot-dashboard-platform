import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getRedis } from '@/lib/redis'
import { getMqttClient } from '@/services/mqtt'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { league: string; gameId: string } }
) {
  try {
    // Verify webhook signature
    const signature = request.headers.get('x-webhook-signature')
    const secret = process.env.SPORTS_WEBHOOK_SECRET

    if (!signature || !secret) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.text()
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const data = JSON.parse(body)
    const { league, gameId } = params
    const redis = getRedis()

    // Update cache immediately
    const cacheKey = `sports:${league}:game:${gameId}:score`
    await redis.setex(cacheKey, 300, JSON.stringify({
      ...data,
      timestamp: Date.now(),
    }))

    // Find all widgets watching this game
    const sportsWidgets = await prisma.widget.findMany({
      where: {
        widgetType: 'SPORTS',
        config: {
          path: ['league'],
          equals: league,
        },
        isActive: true,
      },
      include: {
        dashboard: {
          include: {
            user: {
              include: {
                devices: {
                  where: { isActive: true },
                },
              },
            },
          },
        },
      },
    })

    // Broadcast to MQTT for IoT devices
    const mqttClient = getMqttClient()
    for (const widget of sportsWidgets) {
      const user = widget.dashboard.user
      
      // Publish to user's devices
      for (const device of user.devices) {
        const topic = `${device.mqttTopic}/widget/${widget.id}/update`
        mqttClient.publish(topic, JSON.stringify({
          type: 'sports_score',
          data: {
            gameId,
            homeScore: data.homeScore,
            awayScore: data.awayScore,
            quarter: data.quarter,
            timeRemaining: data.timeRemaining,
          },
          timestamp: Date.now(),
        }), { qos: 1 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sports webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}