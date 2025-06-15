import { NextResponse } from 'next/server'
import { WeatherService } from '@/services/weatherService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location') || 'New York'
  const units = (searchParams.get('units') as 'metric' | 'imperial') || 'metric'
  
  try {
    const weatherService = WeatherService.getInstance()
    const data = await weatherService.getWeatherData(location, units)
    
    return NextResponse.json({
      status: 'success',
      location,
      units,
      data,
      usingApi: !!process.env.OPENWEATHER_API_KEY,
      apiKeyPresent: !!process.env.OPENWEATHER_API_KEY,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      location,
      units,
      error: error instanceof Error ? error.message : 'Unknown error',
      usingApi: !!process.env.OPENWEATHER_API_KEY,
      apiKeyPresent: !!process.env.OPENWEATHER_API_KEY
    }, { status: 500 })
  }
}