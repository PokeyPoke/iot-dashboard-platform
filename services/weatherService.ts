interface WeatherData {
  location: string
  temperature: number
  condition: string
  description: string
  humidity: number
  windSpeed: number
  pressure?: number
  visibility?: number
  uvIndex?: number
  feelsLike?: number
  forecast?: WeatherForecast[]
}

interface WeatherForecast {
  date: string
  high: number
  low: number
  condition: string
  humidity: number
  windSpeed: number
}

export class WeatherService {
  private static instance: WeatherService
  private cache = new Map<string, { data: WeatherData; timestamp: number }>()
  private readonly CACHE_DURATION = 600000 // 10 minutes

  static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService()
    }
    return WeatherService.instance
  }

  async getWeatherData(location: string, units: 'metric' | 'imperial' = 'metric'): Promise<WeatherData> {
    const cacheKey = `${location}_${units}`
    const cached = this.cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      // Try OpenWeatherMap API first
      const openWeatherKey = process.env.OPENWEATHER_API_KEY
      if (openWeatherKey) {
        const data = await this.fetchFromOpenWeatherMap(location, units, openWeatherKey)
        this.cache.set(cacheKey, { data, timestamp: Date.now() })
        return data
      }

      // Fallback to mock data
      const data = this.getMockData(location, units)
      this.cache.set(cacheKey, { data, timestamp: Date.now() })
      return data
    } catch (error) {
      console.error('Error fetching weather data:', error)
      return this.getMockData(location, units)
    }
  }

  private async fetchFromOpenWeatherMap(location: string, units: string, apiKey: string): Promise<WeatherData> {
    // First get coordinates from location
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
    )
    
    if (!geoResponse.ok) {
      throw new Error('Geocoding API error')
    }

    const geoData = await geoResponse.json()
    if (!geoData.length) {
      throw new Error('Location not found')
    }

    const { lat, lon } = geoData[0]

    // Get current weather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`
    )
    
    if (!weatherResponse.ok) {
      throw new Error('Weather API error')
    }

    const weatherData = await weatherResponse.json()

    // Get forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=${units}&appid=${apiKey}`
    )
    
    let forecast: WeatherForecast[] = []
    if (forecastResponse.ok) {
      const forecastData = await forecastResponse.json()
      forecast = this.processForecast(forecastData.list, units)
    }

    return {
      location: `${weatherData.name}, ${weatherData.sys.country}`,
      temperature: Math.round(weatherData.main.temp),
      condition: weatherData.weather[0].main,
      description: weatherData.weather[0].description,
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed),
      pressure: weatherData.main.pressure,
      visibility: weatherData.visibility ? Math.round(weatherData.visibility / 1000) : undefined,
      uvIndex: undefined, // Would need UV Index API call
      feelsLike: Math.round(weatherData.main.feels_like),
      forecast
    }
  }

  private processForecast(forecastList: any[], units: string): WeatherForecast[] {
    const dailyForecasts = new Map<string, any[]>()
    
    // Group forecasts by date
    forecastList.forEach(item => {
      const date = item.dt_txt.split(' ')[0]
      if (!dailyForecasts.has(date)) {
        dailyForecasts.set(date, [])
      }
      dailyForecasts.get(date)!.push(item)
    })

    // Process each day
    const result: WeatherForecast[] = []
    dailyForecasts.forEach((dayData, date) => {
      const temps = dayData.map(item => item.main.temp)
      const high = Math.round(Math.max(...temps))
      const low = Math.round(Math.min(...temps))
      
      // Use midday forecast for condition
      const middayForecast = dayData[Math.floor(dayData.length / 2)]
      
      result.push({
        date,
        high,
        low,
        condition: middayForecast.weather[0].main,
        humidity: middayForecast.main.humidity,
        windSpeed: Math.round(middayForecast.wind.speed)
      })
    })

    return result.slice(0, 5) // Return 5 day forecast
  }

  private getMockData(location: string, units: 'metric' | 'imperial'): WeatherData {
    const conditions = ['Clear', 'Clouds', 'Rain', 'Snow', 'Thunderstorm']
    const condition = conditions[Math.floor(Math.random() * conditions.length)]
    
    const baseTemp = units === 'metric' ? 20 : 68
    const tempRange = units === 'metric' ? 30 : 54
    const temperature = Math.round(baseTemp + (Math.random() - 0.5) * tempRange)

    const forecast: WeatherForecast[] = []
    for (let i = 1; i <= 5; i++) {
      const date = new Date()
      date.setDate(date.getDate() + i)
      
      forecast.push({
        date: date.toISOString().split('T')[0],
        high: temperature + Math.round((Math.random() - 0.5) * 10),
        low: temperature - Math.round(Math.random() * 10),
        condition: conditions[Math.floor(Math.random() * conditions.length)],
        humidity: Math.round(40 + Math.random() * 40),
        windSpeed: Math.round(Math.random() * 20)
      })
    }

    return {
      location,
      temperature,
      condition,
      description: condition.toLowerCase(),
      humidity: Math.round(40 + Math.random() * 40),
      windSpeed: Math.round(Math.random() * 20),
      pressure: Math.round(1000 + Math.random() * 50),
      visibility: Math.round(5 + Math.random() * 10),
      uvIndex: Math.round(Math.random() * 10),
      feelsLike: temperature + Math.round((Math.random() - 0.5) * 5),
      forecast
    }
  }
}