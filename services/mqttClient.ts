import mqtt from 'mqtt'
import { mqttLogger } from '@/lib/logger'

interface RetryConfig {
  maxRetries: number
  baseDelay: number
  maxDelay: number
  exponentialBase: number
}

interface MQTTClientConfig {
  brokerUrl: string
  username?: string
  password?: string
  retryConfig?: RetryConfig
  internalApiKey: string
  apiBaseUrl: string
}

export class EnhancedMQTTClient {
  private client: mqtt.MqttClient | null = null
  private config: MQTTClientConfig
  private reconnectAttempts = 0
  private isConnected = false
  
  private defaultRetryConfig: RetryConfig = {
    maxRetries: 5,
    baseDelay: 1000, // 1 second
    maxDelay: 30000, // 30 seconds
    exponentialBase: 2
  }

  constructor(config: MQTTClientConfig) {
    this.config = {
      ...config,
      retryConfig: { ...this.defaultRetryConfig, ...config.retryConfig }
    }
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      mqttLogger.info({ brokerUrl: this.config.brokerUrl }, 'Connecting to MQTT broker')
      
      this.client = mqtt.connect(this.config.brokerUrl, {
        username: this.config.username,
        password: this.config.password,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
        keepalive: 60,
        clean: true,
        clientId: `iot-dashboard-${Date.now()}`
      })

      this.client.on('connect', () => {
        this.isConnected = true
        this.reconnectAttempts = 0
        mqttLogger.info('Connected to MQTT broker')
        
        // Subscribe to all IoT device topics
        this.client!.subscribe('iot/+/data', { qos: 1 }, (err) => {
          if (err) {
            mqttLogger.error({ error: err.message }, 'Failed to subscribe to topics')
            reject(err)
          } else {
            mqttLogger.info('Subscribed to iot/+/data')
            resolve()
          }
        })
      })

      this.client.on('message', this.handleMessage.bind(this))
      this.client.on('error', this.handleError.bind(this))
      this.client.on('disconnect', this.handleDisconnect.bind(this))
      this.client.on('reconnect', this.handleReconnect.bind(this))
    })
  }

  private async handleMessage(topic: string, message: Buffer): Promise<void> {
    try {
      mqttLogger.debug({ topic, messageSize: message.length }, 'Received MQTT message')
      
      const payload = JSON.parse(message.toString())
      
      // Extract device token from topic (format: iot/{deviceToken}/data)
      const topicParts = topic.split('/')
      if (topicParts.length !== 3 || topicParts[0] !== 'iot' || topicParts[2] !== 'data') {
        mqttLogger.warn({ topic }, 'Invalid topic format')
        return
      }
      
      const deviceToken = topicParts[1]
      
      // Prepare data for API ingestion
      const apiPayload = {
        deviceToken,
        topic,
        data: payload,
        timestamp: new Date().toISOString(),
        metadata: {
          qos: 1,
          retain: false,
          messageId: `mqtt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        }
      }
      
      // Send to internal API with retry mechanism
      await this.sendToApiWithRetry(apiPayload)
      
    } catch (error) {
      mqttLogger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        topic,
        messagePreview: message.toString().substring(0, 100)
      }, 'Failed to process MQTT message')
    }
  }

  private async sendToApiWithRetry(payload: any, attempt = 1): Promise<void> {
    const { maxRetries, baseDelay, maxDelay, exponentialBase } = this.config.retryConfig!
    
    try {
      const response = await fetch(`${this.config.apiBaseUrl}/api/internal/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-API-Key': this.config.internalApiKey
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      mqttLogger.info({ 
        deviceToken: payload.deviceToken,
        attempt,
        success: result.success 
      }, 'Data successfully sent to API')

    } catch (error) {
      mqttLogger.error({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        attempt,
        maxRetries,
        deviceToken: payload.deviceToken
      }, 'Failed to send data to API')

      if (attempt < maxRetries) {
        const delay = Math.min(
          baseDelay * Math.pow(exponentialBase, attempt - 1),
          maxDelay
        )
        
        mqttLogger.info({ 
          delay,
          nextAttempt: attempt + 1,
          deviceToken: payload.deviceToken
        }, 'Retrying API request')
        
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.sendToApiWithRetry(payload, attempt + 1)
      } else {
        // All retries exhausted - could implement dead letter queue here
        mqttLogger.error({ 
          deviceToken: payload.deviceToken,
          finalAttempt: attempt
        }, 'All retry attempts exhausted - data lost')
        
        // TODO: Implement dead letter queue
        // await this.sendToDeadLetterQueue(payload)
      }
    }
  }

  private handleError(error: Error): void {
    mqttLogger.error({ error: error.message }, 'MQTT client error')
  }

  private handleDisconnect(): void {
    this.isConnected = false
    mqttLogger.warn('Disconnected from MQTT broker')
  }

  private handleReconnect(): void {
    this.reconnectAttempts++
    mqttLogger.info({ attempt: this.reconnectAttempts }, 'Reconnecting to MQTT broker')
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      return new Promise((resolve) => {
        this.client!.end(false, {}, () => {
          mqttLogger.info('Disconnected from MQTT broker')
          resolve()
        })
      })
    }
  }

  isClientConnected(): boolean {
    return this.isConnected && this.client?.connected === true
  }
}

// Factory function to create configured MQTT client
export function createMQTTClient(): EnhancedMQTTClient {
  return new EnhancedMQTTClient({
    brokerUrl: process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883',
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    internalApiKey: process.env.INTERNAL_API_KEY || 'dev-internal-key-change-in-production',
    apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
    retryConfig: {
      maxRetries: parseInt(process.env.MQTT_RETRY_MAX_RETRIES || '5'),
      baseDelay: parseInt(process.env.MQTT_RETRY_BASE_DELAY || '1000'),
      maxDelay: parseInt(process.env.MQTT_RETRY_MAX_DELAY || '30000'),
      exponentialBase: parseFloat(process.env.MQTT_RETRY_EXPONENTIAL_BASE || '2')
    }
  })
}