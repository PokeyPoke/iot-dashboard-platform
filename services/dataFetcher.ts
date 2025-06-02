import { getCachedData, setCachedData } from '@/lib/redis'
import axios from 'axios'

const API_ENDPOINTS = {
  stock: process.env.ALPHA_VANTAGE_API_KEY 
    ? `https://www.alphavantage.co/query?apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
    : null,
  weather: process.env.OPENWEATHER_API_KEY
    ? `https://api.openweathermap.org/data/2.5/weather?appid=${process.env.OPENWEATHER_API_KEY}`
    : null,
  crypto: process.env.COINAPI_KEY
    ? `https://rest.coinapi.io/v1/exchangerate`
    : 'https://api.coingecko.com/api/v3',
}

export interface CacheConfig {
  crypto: { baseInterval: number; minInterval: number; maxInterval: number; scalingFactor: number }
  stocks: { baseInterval: number; minInterval: number; maxInterval: number; scalingFactor: number }
  weather: { baseInterval: number; minInterval: number; maxInterval: number; scalingFactor: number }
  news: { baseInterval: number; minInterval: number; maxInterval: number; scalingFactor: number }
  sports: { baseInterval: number; minInterval: number; maxInterval: number; scalingFactor: number }
  transit: { baseInterval: number; minInterval: number; maxInterval: number; scalingFactor: number }
}

const CACHE_CONFIG: CacheConfig = {
  crypto: {
    baseInterval: 30,
    minInterval: 15,
    maxInterval: 300,
    scalingFactor: 0.8,
  },
  stocks: {
    baseInterval: 60,
    minInterval: 15,
    maxInterval: 600,
    scalingFactor: 0.7,
  },
  weather: {
    baseInterval: 600,
    minInterval: 300,
    maxInterval: 3600,
    scalingFactor: 0.9,
  },
  news: {
    baseInterval: 300,
    minInterval: 300,
    maxInterval: 1800,
    scalingFactor: 0.9,
  },
  sports: {
    baseInterval: 30,
    minInterval: 30,
    maxInterval: 1800,
    scalingFactor: 0.8,
  },
  transit: {
    baseInterval: 60,
    minInterval: 60,
    maxInterval: 300,
    scalingFactor: 0.9,
  },
}

export async function fetchStockData(symbol: string): Promise<any> {
  const cacheKey = `stock:${symbol}:quote`
  const cached = await getCachedData(cacheKey)
  
  if (cached) {
    return cached
  }

  try {
    let data
    
    if (API_ENDPOINTS.stock) {
      // Use Alpha Vantage
      const response = await axios.get(`${API_ENDPOINTS.stock}&function=GLOBAL_QUOTE&symbol=${symbol}`)
      const quote = response.data['Global Quote']
      
      data = {
        symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        timestamp: Date.now(),
      }
    } else {
      // Fallback: Generate mock data
      data = {
        symbol,
        price: 150 + Math.random() * 10,
        change: (Math.random() - 0.5) * 5,
        changePercent: (Math.random() - 0.5) * 3,
        timestamp: Date.now(),
      }
    }

    await setCachedData(cacheKey, data, CACHE_CONFIG.stocks.baseInterval)
    return data
  } catch (error) {
    console.error('Error fetching stock data:', error)
    throw error
  }
}

export async function fetchWeatherData(location: string, units: string = 'metric'): Promise<any> {
  const cacheKey = `weather:${location}:${units}:current`
  const cached = await getCachedData(cacheKey)
  
  if (cached) {
    return cached
  }

  try {
    let data
    
    if (API_ENDPOINTS.weather) {
      // Use OpenWeatherMap
      const response = await axios.get(`${API_ENDPOINTS.weather}&q=${location}&units=${units}`)
      
      data = {
        location,
        temperature: Math.round(response.data.main.temp),
        condition: response.data.weather[0].main,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind.speed,
        timestamp: Date.now(),
      }
    } else {
      // Fallback: Generate mock data
      data = {
        location,
        temperature: Math.round(20 + Math.random() * 10),
        condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(5 + Math.random() * 15),
        timestamp: Date.now(),
      }
    }

    await setCachedData(cacheKey, data, CACHE_CONFIG.weather.baseInterval)
    return data
  } catch (error) {
    console.error('Error fetching weather data:', error)
    throw error
  }
}

export async function fetchCryptoData(coin: string, currency: string = 'USD'): Promise<any> {
  const cacheKey = `crypto:${coin}:${currency}:price`
  const cached = await getCachedData(cacheKey)
  
  if (cached) {
    return cached
  }

  try {
    let data
    
    if (API_ENDPOINTS.crypto && process.env.COINAPI_KEY) {
      // Use CoinAPI
      const response = await axios.get(
        `${API_ENDPOINTS.crypto}/${coin}/${currency}`,
        {
          headers: { 'X-CoinAPI-Key': process.env.COINAPI_KEY }
        }
      )
      
      data = {
        coin,
        currency,
        price: response.data.rate,
        change24h: response.data.change_24h || 0,
        changePercent24h: response.data.change_percent_24h || 0,
        timestamp: Date.now(),
      }
    } else {
      // Use CoinGecko (free)
      const response = await axios.get(
        `${API_ENDPOINTS.crypto}/simple/price?ids=${coin.toLowerCase()}&vs_currencies=${currency.toLowerCase()}&include_24hr_change=true`
      )
      const coinData = response.data[coin.toLowerCase()]
      
      data = {
        coin,
        currency,
        price: coinData[currency.toLowerCase()],
        change24h: 0, // CoinGecko doesn't provide absolute change
        changePercent24h: coinData[`${currency.toLowerCase()}_24h_change`] || 0,
        timestamp: Date.now(),
      }
    }

    await setCachedData(cacheKey, data, CACHE_CONFIG.crypto.baseInterval)
    return data
  } catch (error) {
    console.error('Error fetching crypto data:', error)
    throw error
  }
}

export async function fetchNewsData(category?: string, sources?: string[]): Promise<any> {
  const cacheKey = `news:${category || 'general'}:${sources?.join(',') || 'all'}`
  const cached = await getCachedData(cacheKey)
  
  if (cached) {
    return cached
  }

  try {
    // Mock news data for now
    const data = {
      articles: [
        {
          title: 'Breaking: Major Tech Announcement',
          description: 'Leading tech companies announce new partnership',
          source: 'Tech News',
          publishedAt: new Date().toISOString(),
          url: '#',
        },
        {
          title: 'Market Update: Stocks Rise',
          description: 'Global markets show positive trends',
          source: 'Financial Times',
          publishedAt: new Date().toISOString(),
          url: '#',
        },
      ],
      timestamp: Date.now(),
    }

    await setCachedData(cacheKey, data, CACHE_CONFIG.news.baseInterval)
    return data
  } catch (error) {
    console.error('Error fetching news data:', error)
    throw error
  }
}

export function calculateCacheInterval(dataType: keyof CacheConfig, subscriberCount: number): number {
  const config = CACHE_CONFIG[dataType]
  const scaledInterval = config.baseInterval * Math.pow(config.scalingFactor, Math.log10(subscriberCount))
  
  return Math.max(config.minInterval, Math.min(config.maxInterval, scaledInterval))
}