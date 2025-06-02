import mqtt from 'mqtt'
import { prisma } from '@/lib/prisma'

let mqttClient: mqtt.MqttClient | null = null

export function getMqttClient(): mqtt.MqttClient {
  if (!mqttClient) {
    const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883'
    
    mqttClient = mqtt.connect(brokerUrl, {
      username: process.env.MQTT_USERNAME,
      password: process.env.MQTT_PASSWORD,
      reconnectPeriod: 5000,
      connectTimeout: 30000,
      keepalive: 60,
    })

    mqttClient.on('connect', () => {
      console.log('Connected to MQTT broker')
      
      // Subscribe to device heartbeat topics
      mqttClient!.subscribe('dashboard/+/+/heartbeat')
      mqttClient!.subscribe('dashboard/+/+/status')
    })

    mqttClient.on('error', (error) => {
      console.error('MQTT error:', error)
    })

    mqttClient.on('message', async (topic, message) => {
      try {
        const parts = topic.split('/')
        if (parts.length >= 4) {
          const [, userId, deviceId, messageType] = parts
          
          if (messageType === 'heartbeat') {
            // Update device last seen
            await prisma.device.updateMany({
              where: {
                userId,
                mqttTopic: `dashboard/${userId}/${deviceId}`,
              },
              data: {
                lastSeen: new Date(),
              },
            })
          }
        }
      } catch (error) {
        console.error('Error processing MQTT message:', error)
      }
    })
  }

  return mqttClient
}

export async function publishToDevice(
  deviceToken: string,
  widgetId: string,
  data: any
): Promise<void> {
  const device = await prisma.device.findUnique({
    where: { apiToken: deviceToken },
  })

  if (!device || !device.isActive) {
    throw new Error('Device not found or inactive')
  }

  const client = getMqttClient()
  const topic = `${device.mqttTopic}/widget/${widgetId}`
  
  // Format data for IoT device
  const iotData = {
    timestamp: Date.now(),
    widget: widgetId,
    data: formatDataForIoT(data, device.deviceType),
  }

  client.publish(topic, JSON.stringify(iotData), {
    qos: 1,
    retain: true,
  })
}

export async function publishDashboardUpdate(
  userId: string,
  dashboardId: string,
  data: any
): Promise<void> {
  const devices = await prisma.device.findMany({
    where: {
      userId,
      isActive: true,
    },
  })

  const client = getMqttClient()
  
  for (const device of devices) {
    const topic = `${device.mqttTopic}/dashboard/${dashboardId}`
    
    client.publish(topic, JSON.stringify(data), {
      qos: 1,
      retain: true,
    })
  }
}

function formatDataForIoT(data: any, deviceType: string): any {
  // Optimize data format based on device type
  switch (deviceType) {
    case 'ESP32_DISPLAY':
      return {
        // Minimal format for small displays
        v: data.value || data.price || data.temperature,
        c: data.change || data.changePercent,
        t: data.timestamp,
      }
    case 'RASPBERRY_PI':
      // Full data for more capable devices
      return data
    default:
      return data
  }
}