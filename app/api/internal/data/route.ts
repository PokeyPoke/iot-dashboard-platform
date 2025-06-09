import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { withInternalAuth } from '@/middleware/internalAuth'
import { rateLimit } from '@/middleware/rateLimit'

// Robust data validation schema
const deviceDataSchema = z.object({
  deviceToken: z.string().uuid('Invalid device token format'),
  topic: z.string().min(1, 'Topic is required'),
  data: z.record(z.any()).refine(
    (data) => Object.keys(data).length > 0,
    'Data payload cannot be empty'
  ),
  timestamp: z.string().datetime().optional(),
  metadata: z.object({
    qos: z.number().min(0).max(2).optional(),
    retain: z.boolean().optional(),
    messageId: z.string().optional(),
  }).optional()
})

type DeviceDataPayload = z.infer<typeof deviceDataSchema>

// Rate limit for internal data ingestion
const dataIngestionRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 1000, // 1000 data points per minute
  keyGenerator: (req) => req.headers.get('x-internal-api-key') || 'anonymous',
  message: 'Data ingestion rate limit exceeded'
})

export async function POST(request: NextRequest) {
  return dataIngestionRateLimit(request, async () => {
    return withInternalAuth(request, async (req) => {
      try {
        console.log('🔄 Processing internal data ingestion request')
        
        const body = await request.json()
        const validatedData = deviceDataSchema.parse(body)
        
        console.log('✅ Data validation passed:', {
          deviceToken: validatedData.deviceToken,
          topic: validatedData.topic,
          dataKeys: Object.keys(validatedData.data),
          timestamp: validatedData.timestamp
        })

        // Verify device exists and is active
        const device = await prisma.device.findFirst({
          where: {
            apiToken: validatedData.deviceToken,
            isActive: true
          }
        })

        if (!device) {
          console.warn('❌ Device not found or inactive:', validatedData.deviceToken)
          return NextResponse.json(
            { error: 'Device not found or inactive' },
            { status: 404 }
          )
        }

        // Update device last seen
        await prisma.device.update({
          where: { id: device.id },
          data: { lastSeen: new Date() }
        })

        // Store the data (you might want to create a separate DataPoint model)
        // For now, we'll just log it and return success
        console.log('📊 Data received from device:', {
          deviceId: device.id,
          deviceName: device.deviceName,
          topic: validatedData.topic,
          dataSize: JSON.stringify(validatedData.data).length
        })

        // TODO: Store in time-series database or data storage solution
        // This could be InfluxDB, TimescaleDB, or a simple JSON column

        return NextResponse.json({
          success: true,
          message: 'Data ingested successfully',
          deviceId: device.id,
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        if (error instanceof z.ZodError) {
          console.error('❌ Data validation failed:', error.errors)
          return NextResponse.json(
            { 
              error: 'Invalid data format',
              details: error.errors 
            },
            { status: 400 }
          )
        }

        console.error('❌ Internal data ingestion error:', error)
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        )
      }
    })
  })
}