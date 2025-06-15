import { NextResponse } from 'next/server'

export async function GET() {
  const envVars = process.env
  
  // Find all environment variables that might be API keys
  const apiRelatedVars: Record<string, string> = {}
  
  Object.keys(envVars).forEach(key => {
    const value = envVars[key]
    if (value && (
      key.toLowerCase().includes('api') ||
      key.toLowerCase().includes('key') ||
      key.toLowerCase().includes('secret') ||
      key.toLowerCase().includes('token') ||
      key.toLowerCase().includes('alpha') ||
      key.toLowerCase().includes('weather') ||
      key.toLowerCase().includes('news') ||
      key.toLowerCase().includes('coin') ||
      key.toLowerCase().includes('moralis')
    ) && !key.startsWith('RAILWAY_') && !key.includes('JWT') && !key.includes('NEXTAUTH')) {
      // Show first 8 characters for security
      apiRelatedVars[key] = value.length > 8 ? `${value.substring(0, 8)}...` : value
    }
  })
  
  return NextResponse.json({
    status: 'success',
    message: 'All API-related environment variables',
    apiRelatedVars,
    totalFound: Object.keys(apiRelatedVars).length,
    timestamp: new Date().toISOString()
  })
}