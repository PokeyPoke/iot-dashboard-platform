import { POST } from '@/app/api/internal/data/route'
import { NextRequest } from 'next/server'

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    device: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('/api/internal/data', () => {
  const mockPrisma = require('@/lib/prisma').prisma

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should require X-Internal-API-Key header', async () => {
    const request = new NextRequest('http://localhost:3000/api/internal/data', {
      method: 'POST',
      body: JSON.stringify({
        deviceToken: '123e4567-e89b-12d3-a456-426614174000',
        topic: 'iot/device1/data',
        data: { temperature: 25 },
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(401)
    expect(body.error).toBe('Missing X-Internal-API-Key header')
  })

  it('should validate API key', async () => {
    const request = new NextRequest('http://localhost:3000/api/internal/data', {
      method: 'POST',
      headers: {
        'X-Internal-API-Key': 'invalid-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceToken: '123e4567-e89b-12d3-a456-426614174000',
        topic: 'iot/device1/data',
        data: { temperature: 25 },
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(403)
    expect(body.error).toBe('Invalid API key')
  })

  it('should validate device token format', async () => {
    const request = new NextRequest('http://localhost:3000/api/internal/data', {
      method: 'POST',
      headers: {
        'X-Internal-API-Key': 'test-internal-api-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceToken: 'invalid-uuid',
        topic: 'iot/device1/data',
        data: { temperature: 25 },
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(body.error).toBe('Invalid data format')
    expect(body.details).toContainEqual(
      expect.objectContaining({
        message: 'Invalid device token format',
      })
    )
  })

  it('should process valid data successfully', async () => {
    const mockDevice = {
      id: 'device-id-123',
      deviceName: 'Test Device',
      apiToken: '123e4567-e89b-12d3-a456-426614174000',
    }

    mockPrisma.device.findFirst.mockResolvedValue(mockDevice)
    mockPrisma.device.update.mockResolvedValue(mockDevice)

    const request = new NextRequest('http://localhost:3000/api/internal/data', {
      method: 'POST',
      headers: {
        'X-Internal-API-Key': 'test-internal-api-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceToken: '123e4567-e89b-12d3-a456-426614174000',
        topic: 'iot/device1/data',
        data: { temperature: 25, humidity: 60 },
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.deviceId).toBe('device-id-123')
    expect(mockPrisma.device.findFirst).toHaveBeenCalledWith({
      where: {
        apiToken: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
      },
    })
    expect(mockPrisma.device.update).toHaveBeenCalledWith({
      where: { id: 'device-id-123' },
      data: { lastSeen: expect.any(Date) },
    })
  })

  it('should return 404 for non-existent device', async () => {
    mockPrisma.device.findFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/internal/data', {
      method: 'POST',
      headers: {
        'X-Internal-API-Key': 'test-internal-api-key',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        deviceToken: '123e4567-e89b-12d3-a456-426614174000',
        topic: 'iot/device1/data',
        data: { temperature: 25 },
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(404)
    expect(body.error).toBe('Device not found or inactive')
  })
})