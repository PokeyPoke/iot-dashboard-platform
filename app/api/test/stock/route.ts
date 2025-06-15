import { NextResponse } from 'next/server'
import { StockService } from '@/services/stockService'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'AAPL'
  
  try {
    const stockService = StockService.getInstance()
    const data = await stockService.getStockData(symbol)
    
    return NextResponse.json({
      status: 'success',
      symbol,
      data,
      usingAlphaVantage: !!process.env.ALPHA_VANTAGE_API_KEY,
      alphaVantageKeyPresent: !!process.env.ALPHA_VANTAGE_API_KEY,
      usingYahooFinance: !process.env.ALPHA_VANTAGE_API_KEY, // Falls back to Yahoo
      dataSource: process.env.ALPHA_VANTAGE_API_KEY ? 'Alpha Vantage' : 'Yahoo Finance',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      symbol,
      error: error instanceof Error ? error.message : 'Unknown error',
      usingApi: !!process.env.ALPHA_VANTAGE_API_KEY,
      apiKeyPresent: !!process.env.ALPHA_VANTAGE_API_KEY
    }, { status: 500 })
  }
}