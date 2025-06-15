import { NextResponse } from 'next/server'

export async function GET() {
  const openweatherKey1 = process.env.OPENWEATHERMAP_API_KEY
  const openweatherKey2 = process.env.OPENWEATHER_API_KEY
  
  return NextResponse.json({
    status: 'success',
    message: 'Weather API key detection debug',
    keys: {
      OPENWEATHERMAP_API_KEY: openweatherKey1 ? `${openweatherKey1.substring(0, 8)}...` : 'NOT FOUND',
      OPENWEATHER_API_KEY: openweatherKey2 ? `${openweatherKey2.substring(0, 8)}...` : 'NOT FOUND',
      keyExists: !!(openweatherKey1 || openweatherKey2),
      primaryKey: openweatherKey1 || openweatherKey2 || 'NONE',
      primaryKeyLength: (openweatherKey1 || openweatherKey2 || '').length
    },
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.toLowerCase().includes('weather') || 
      key.toLowerCase().includes('openweather')
    ),
    timestamp: new Date().toISOString()
  })
}