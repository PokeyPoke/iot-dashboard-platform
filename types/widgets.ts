export interface IWidget {
  id: string
  type: string
  name: string
  description: string
  configSchema: object
  dataSchema: object
  updateInterval: number
  apiRequirements: string[]
  deviceFormats: {
    web: object
    iot: object
    minimal: object
  }
}

export interface WidgetConfig {
  [key: string]: any
}

export interface WidgetData {
  timestamp: number
  data: any
  error?: string
}

export interface StockWidgetConfig extends WidgetConfig {
  symbol: string
  displayMode: 'price' | 'chart' | 'detailed'
  chartPeriod?: '1D' | '1W' | '1M' | '3M' | '1Y'
}

export interface WeatherWidgetConfig extends WidgetConfig {
  location: string
  units: 'metric' | 'imperial'
  displayMode: 'current' | 'forecast' | 'detailed'
}

export interface CryptoWidgetConfig extends WidgetConfig {
  coin: string
  currency: string
  displayMode: 'price' | 'chart' | 'detailed'
  chartPeriod?: '24h' | '7d' | '30d' | '1y'
}

export interface NewsWidgetConfig extends WidgetConfig {
  category?: string
  sources?: string[]
  keywords?: string[]
  maxArticles: number
}

export interface SportsWidgetConfig extends WidgetConfig {
  league: 'NFL' | 'NBA' | 'MLB' | 'NHL'
  team: string
  displayMode: 'scores' | 'schedule' | 'standings'
}

export interface TransitWidgetConfig extends WidgetConfig {
  stopId: string
  routeId?: string
  direction?: string
  maxDepartures: number
}