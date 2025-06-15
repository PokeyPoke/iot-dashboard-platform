interface CryptoData {
  symbol: string
  name: string
  price: number
  change24h: number
  changePercent24h: number
  marketCap?: number
  volume24h?: number
  rank?: number
  circulatingSupply?: number
}

export class CryptoService {
  private static instance: CryptoService
  private cache = new Map<string, { data: CryptoData; timestamp: number }>()
  private readonly CACHE_DURATION = 60000 // 1 minute

  static getInstance(): CryptoService {
    if (!CryptoService.instance) {
      CryptoService.instance = new CryptoService()
    }
    return CryptoService.instance
  }

  async getCryptoData(symbol: string): Promise<CryptoData> {
    const cacheKey = symbol.toLowerCase()
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // Try Moralis API first (if available)
      const moralisKey = process.env.MORALIS_API_KEY
      if (moralisKey) {
        try {
          const data = await this.fetchFromMoralis(symbol, moralisKey)
          this.cache.set(cacheKey, { data, timestamp: Date.now() })
          return data
        } catch (error) {
          console.log('Moralis API failed, falling back to CoinGecko')
        }
      }

      // Fallback to CoinGecko (free, no API key required)
      const data = await this.fetchFromCoinGecko(symbol)
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching crypto data:', error)
      // Return mock data as fallback
      return this.getMockData(symbol)
    }
  }

  private async fetchFromMoralis(symbol: string, apiKey: string): Promise<CryptoData> {
    // Moralis Web3 API for token prices
    const response = await fetch(
      `https://deep-index.moralis.io/api/v2/erc20/prices?chain=eth&include=percent_change`,
      {
        headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        }
      }
    )
    
    if (!response.ok) {
      throw new Error('Moralis API error')
    }

    const data = await response.json()
    
    // Find token by symbol (this is a simplified implementation)
    // In production, you'd want to use token addresses
    const token = data.find((t: any) => 
      t.tokenSymbol?.toLowerCase() === symbol.toLowerCase()
    )
    
    if (!token) {
      throw new Error(`Token ${symbol} not found in Moralis data`)
    }

    return {
      symbol: token.tokenSymbol?.toUpperCase() || symbol.toUpperCase(),
      name: token.tokenName || symbol,
      price: parseFloat(token.usdPrice || '0'),
      change24h: parseFloat(token.usdPrice24hrPercentChange || '0'),
      changePercent24h: parseFloat(token.usdPrice24hrPercentChange || '0'),
      marketCap: parseFloat(token.usdMarketCap || '0')
    }
  }

  private async fetchFromCoinGecko(symbol: string): Promise<CryptoData> {
    // CoinGecko API - supports all major cryptocurrencies including Solana
    const coingeckoKey = process.env.COINGECKO_API_KEY
    const headers = coingeckoKey ? { 'x-cg-pro-api-key': coingeckoKey } : {}
    
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${this.symbolToId(symbol)}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`,
      { headers }
    )
    
    if (!response.ok) {
      throw new Error('CoinGecko API error')
    }

    const data = await response.json()
    const coinId = this.symbolToId(symbol)
    const coinData = data[coinId]
    
    if (!coinData) {
      throw new Error(`Cryptocurrency ${symbol} not found`)
    }

    const change24h = coinData.usd_24h_change || 0

    return {
      symbol: symbol.toUpperCase(),
      name: this.idToName(coinId),
      price: coinData.usd,
      change24h: (coinData.usd * change24h) / 100,
      changePercent24h: change24h,
      marketCap: coinData.usd_market_cap,
      volume24h: coinData.usd_24h_vol
    }
  }

  private symbolToId(symbol: string): string {
    // Map common symbols to CoinGecko IDs
    const symbolMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'SOL': 'solana',
      'ADA': 'cardano',
      'DOT': 'polkadot',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'USDC': 'usd-coin',
      'USDT': 'tether',
      'BNB': 'binancecoin',
      'XRP': 'ripple',
      'MATIC': 'matic-network',
      'AVAX': 'avalanche-2',
      'ATOM': 'cosmos',
      'ALGO': 'algorand',
      'ICP': 'internet-computer',
      'NEAR': 'near',
      'FTM': 'fantom',
      'SAND': 'the-sandbox',
      'MANA': 'decentraland'
    }
    
    return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase()
  }

  private idToName(id: string): string {
    const nameMap: Record<string, string> = {
      'bitcoin': 'Bitcoin',
      'ethereum': 'Ethereum', 
      'solana': 'Solana',
      'cardano': 'Cardano',
      'polkadot': 'Polkadot',
      'chainlink': 'Chainlink',
      'uniswap': 'Uniswap',
      'usd-coin': 'USD Coin',
      'tether': 'Tether',
      'binancecoin': 'Binance Coin',
      'ripple': 'XRP',
      'matic-network': 'Polygon',
      'avalanche-2': 'Avalanche',
      'cosmos': 'Cosmos',
      'algorand': 'Algorand',
      'internet-computer': 'Internet Computer',
      'near': 'NEAR Protocol',
      'fantom': 'Fantom',
      'the-sandbox': 'The Sandbox',
      'decentraland': 'Decentraland'
    }
    
    return nameMap[id] || id.charAt(0).toUpperCase() + id.slice(1)
  }

  private getMockData(symbol: string): CryptoData {
    // Generate realistic mock data for demo purposes
    const basePrice = symbol === 'BTC' ? 45000 : symbol === 'ETH' ? 3000 : 100
    const change24h = (Math.random() - 0.5) * basePrice * 0.1
    const changePercent24h = (change24h / basePrice) * 100

    return {
      symbol: symbol.toUpperCase(),
      name: this.idToName(this.symbolToId(symbol)),
      price: basePrice + change24h,
      change24h: change24h,
      changePercent24h: changePercent24h,
      marketCap: (basePrice + change24h) * (1000000 + Math.random() * 9000000),
      volume24h: Math.random() * 1000000000,
      rank: Math.floor(Math.random() * 100) + 1
    }
  }
}