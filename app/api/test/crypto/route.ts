import { NextResponse } from 'next/server'
import { CryptoService } from '@/services/cryptoService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'BTC'
  
  try {
    const cryptoService = CryptoService.getInstance()
    const data = await cryptoService.getCryptoData(symbol)
    
    return NextResponse.json({
      status: 'success',
      symbol,
      data,
      usingMoralis: !!process.env.MORALIS_API_KEY,
      moralisKeyPresent: !!process.env.MORALIS_API_KEY,
      usingCoinGecko: true, // Always available as fallback
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      symbol,
      error: error instanceof Error ? error.message : 'Unknown error',
      usingMoralis: !!process.env.MORALIS_API_KEY,
      moralisKeyPresent: !!process.env.MORALIS_API_KEY
    }, { status: 500 })
  }
}