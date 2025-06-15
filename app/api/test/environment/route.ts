import { NextResponse } from 'next/server'

export async function GET() {
  // Check all possible API key variations
  const envVars = process.env
  const apiKeys = {
    // Standard names
    ALPHA_VANTAGE_API_KEY: !!envVars.ALPHA_VANTAGE_API_KEY,
    OPENWEATHER_API_KEY: !!envVars.OPENWEATHER_API_KEY,
    COINAPI_KEY: !!envVars.COINAPI_KEY,
    NEWS_API_KEY: !!envVars.NEWS_API_KEY,
    MORALIS_API_KEY: !!envVars.MORALIS_API_KEY,
    ESPN_WEBHOOK_SECRET: !!envVars.ESPN_WEBHOOK_SECRET,
    
    // Alternative naming patterns
    ALPHAVANTAGE_API_KEY: !!envVars.ALPHAVANTAGE_API_KEY,
    ALPHA_VANTAGE_KEY: !!envVars.ALPHA_VANTAGE_KEY,
    OPENWEATHER_KEY: !!envVars.OPENWEATHER_KEY,
    OPEN_WEATHER_API_KEY: !!envVars.OPEN_WEATHER_API_KEY,
    NEWSAPI_KEY: !!envVars.NEWSAPI_KEY,
    NEWS_KEY: !!envVars.NEWS_KEY,
    
    // Legacy client-side keys
    NEXT_PUBLIC_ALPHA_VANTAGE_KEY: !!envVars.NEXT_PUBLIC_ALPHA_VANTAGE_KEY,
    NEXT_PUBLIC_OPENWEATHER_KEY: !!envVars.NEXT_PUBLIC_OPENWEATHER_KEY,
  }
  
  // Find which keys are actually set
  const setKeys: Record<string, string> = {}
  Object.keys(apiKeys).forEach(key => {
    if (apiKeys[key as keyof typeof apiKeys]) {
      const value = envVars[key]
      if (value) {
        setKeys[key] = `${value.substring(0, 8)}...`
      }
    }
  })
  
  return NextResponse.json({
    status: 'success',
    message: 'Environment check for API keys',
    apiKeysPresent: apiKeys,
    setKeys,
    totalKeysConfigured: Object.values(apiKeys).filter(Boolean).length,
    timestamp: new Date().toISOString()
  })
}