import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'
import { v4 as uuidv4 } from 'uuid'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await hashPassword(process.env.ADMIN_PASSWORD || 'admin123')
  const adminUser = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      username: 'admin',
      passwordHash: adminPassword,
      subscriptionTier: 'PREMIUM',
      apiRateLimitRemaining: 10000,
    },
  })

  console.log('Created admin user:', adminUser.email)

  // Create default dashboard for admin
  const dashboard = await prisma.dashboard.create({
    data: {
      id: uuidv4(),
      userId: adminUser.id,
      name: 'Default Dashboard',
      isDefault: true,
      layoutConfig: {
        lg: [],
        md: [],
        sm: [],
        xs: [],
      },
    },
  })

  console.log('Created default dashboard')

  // Create sample widgets
  const widgets = [
    {
      id: uuidv4(),
      dashboardId: dashboard.id,
      widgetType: 'STOCK' as const,
      title: 'AAPL Stock Price',
      config: {
        symbol: 'AAPL',
        displayMode: 'price',
      },
      positionX: 0,
      positionY: 0,
      width: 4,
      height: 3,
      refreshInterval: 60,
    },
    {
      id: uuidv4(),
      dashboardId: dashboard.id,
      widgetType: 'WEATHER' as const,
      title: 'New York Weather',
      config: {
        location: 'New York',
        units: 'metric',
        displayMode: 'current',
      },
      positionX: 4,
      positionY: 0,
      width: 4,
      height: 3,
      refreshInterval: 600,
    },
    {
      id: uuidv4(),
      dashboardId: dashboard.id,
      widgetType: 'CRYPTO' as const,
      title: 'Bitcoin Price',
      config: {
        coin: 'bitcoin',
        currency: 'USD',
        displayMode: 'price',
      },
      positionX: 8,
      positionY: 0,
      width: 4,
      height: 3,
      refreshInterval: 30,
    },
  ]

  for (const widget of widgets) {
    await prisma.widget.create({ data: widget })
  }

  console.log('Created sample widgets')

  // Create sample device
  const device = await prisma.device.create({
    data: {
      id: uuidv4(),
      userId: adminUser.id,
      deviceName: 'ESP32 Display',
      deviceType: 'ESP32_DISPLAY',
      apiToken: uuidv4(),
      mqttTopic: `dashboard/${adminUser.id}/esp32-display`,
      deviceConfig: {
        screenWidth: 320,
        screenHeight: 240,
        capabilities: ['display', 'wifi', 'mqtt'],
      },
    },
  })

  console.log('Created sample device')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })