interface StockData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume?: number
  marketCap?: number
  dayHigh?: number
  dayLow?: number
  chartData?: { time: string; price: number }[]
}

export class StockService {
  private static instance: StockService
  private cache = new Map<string, { data: StockData; timestamp: number }>()
  private readonly CACHE_DURATION = 60000 // 1 minute

  static getInstance(): StockService {
    if (!StockService.instance) {
      StockService.instance = new StockService()
    }
    return StockService.instance
  }

  async getStockData(symbol: string): Promise<StockData> {
    const cacheKey = symbol.toUpperCase()
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // Try Alpha Vantage first
      const alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY
      if (alphaVantageKey) {
        const data = await this.fetchFromAlphaVantage(symbol, alphaVantageKey)
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
        return data
      }

      // Fallback to Yahoo Finance API (free but limited)
      const data = await this.fetchFromYahooFinance(symbol)
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching stock data:', error)
      // Return mock data as fallback
      return this.getMockData(symbol)
    }
  }

  private async fetchFromAlphaVantage(symbol: string, apiKey: string): Promise<StockData> {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`
    )
    
    if (!response.ok) {
      throw new Error('Alpha Vantage API error')
    }

    const data = await response.json()
    const quote = data['Global Quote']
    
    if (!quote) {
      throw new Error('Invalid response from Alpha Vantage')
    }

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      dayHigh: parseFloat(quote['03. high']),
      dayLow: parseFloat(quote['04. low']),
      volume: parseInt(quote['06. volume'])
    }
  }

  private async fetchFromYahooFinance(symbol: string): Promise<StockData> {
    // Using a free Yahoo Finance API proxy
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`
    )
    
    if (!response.ok) {
      throw new Error('Yahoo Finance API error')
    }

    const data = await response.json()
    const result = data.chart.result[0]
    const meta = result.meta
    const quote = result.indicators.quote[0]
    
    const currentPrice = meta.regularMarketPrice
    const previousClose = meta.previousClose
    const change = currentPrice - previousClose
    const changePercent = (change / previousClose) * 100

    return {
      symbol: meta.symbol,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      dayHigh: meta.regularMarketDayHigh,
      dayLow: meta.regularMarketDayLow,
      volume: meta.regularMarketVolume,
      marketCap: meta.marketCap
    }
  }

  private getMockData(symbol: string): StockData {
    // Generate realistic mock data for demo purposes
    const basePrice = 100 + Math.random() * 400
    const change = (Math.random() - 0.5) * 10
    const changePercent = (change / basePrice) * 100

    return {
      symbol: symbol.toUpperCase(),
      price: basePrice,
      change: change,
      changePercent: changePercent,
      dayHigh: basePrice + Math.random() * 5,
      dayLow: basePrice - Math.random() * 5,
      volume: Math.floor(Math.random() * 10000000),
      chartData: this.generateMockChart(basePrice)
    }
  }

  private generateMockChart(basePrice: number): { time: string; price: number }[] {
    const data = []
    const now = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const variance = (Math.random() - 0.5) * 20
      data.push({
        time: time.toISOString().split('T')[0],
        price: basePrice + variance
      })
    }
    
    return data
  }
}