import pino from 'pino'

// Create structured logger with different configurations for dev/prod
const isDevelopment = process.env.NODE_ENV !== 'production'

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(isDevelopment && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    },
  }),
})

// Create child loggers for different components
export const authLogger = logger.child({ component: 'auth' })
export const apiLogger = logger.child({ component: 'api' })
export const dbLogger = logger.child({ component: 'database' })
export const mqttLogger = logger.child({ component: 'mqtt' })
export const securityLogger = logger.child({ component: 'security' })

// Helper functions for common logging patterns
export const logApiRequest = (req: { method: string; url: string }, userId?: string) => {
  apiLogger.info({
    method: req.method,
    url: req.url,
    userId,
    timestamp: new Date().toISOString(),
  }, 'API request')
}

export const logApiResponse = (req: { method: string; url: string }, status: number, duration?: number) => {
  apiLogger.info({
    method: req.method,
    url: req.url,
    status,
    duration,
    timestamp: new Date().toISOString(),
  }, 'API response')
}

export const logSecurityEvent = (event: string, details: any) => {
  securityLogger.warn({
    event,
    ...details,
    timestamp: new Date().toISOString(),
  }, 'Security event')
}

export const logDatabaseQuery = (operation: string, table: string, duration?: number) => {
  dbLogger.debug({
    operation,
    table,
    duration,
    timestamp: new Date().toISOString(),
  }, 'Database operation')
}