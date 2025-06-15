import { NextResponse } from 'next/server'

export async function GET() {
  const apiKeys = {
    ALPHA_VANTAGE_API_KEY: !!process.env.ALPHA_VANTAGE_API_KEY,
    OPENWEATHER_API_KEY: !!process.env.OPENWEATHER_API_KEY,
    COINAPI_KEY: !!process.env.COINAPI_KEY,
    NEWS_API_KEY: !!process.env.NEWS_API_KEY,
    ESPN_WEBHOOK_SECRET: !!process.env.ESPN_WEBHOOK_SECRET,
    
    // Legacy keys for compatibility check
    NEXT_PUBLIC_ALPHA_VANTAGE_KEY: !!process.env.NEXT_PUBLIC_ALPHA_VANTAGE_KEY,
    NEXT_PUBLIC_OPENWEATHER_KEY: !!process.env.NEXT_PUBLIC_OPENWEATHER_KEY,
  }
  
  const keyDetails = {
    ALPHA_VANTAGE_API_KEY: process.env.ALPHA_VANTAGE_API_KEY ? 
      `${process.env.ALPHA_VANTAGE_API_KEY.substring(0, 8)}...` : 'Not set',
    OPENWEATHER_API_KEY: process.env.OPENWEATHER_API_KEY ? 
      `${process.env.OPENWEATHER_API_KEY.substring(0, 8)}...` : 'Not set',
    COINAPI_KEY: process.env.COINAPI_KEY ? 
      `${process.env.COINAPI_KEY.substring(0, 8)}...` : 'Not set',
    NEWS_API_KEY: process.env.NEWS_API_KEY ? 
      `${process.env.NEWS_API_KEY.substring(0, 8)}...` : 'Not set',
  }
  
  return NextResponse.json({
    status: 'success',
    message: 'Environment check for API keys',
    apiKeysPresent: apiKeys,
    keyDetails,
    totalKeysConfigured: Object.values(apiKeys).filter(Boolean).length,
    timestamp: new Date().toISOString()
  })
}