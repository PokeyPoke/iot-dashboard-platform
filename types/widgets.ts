export interface IWidget {
  id: string
  type: WidgetType
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

export enum WidgetType {
  STOCK = 'STOCK',
  WEATHER = 'WEATHER',
  CRYPTO = 'CRYPTO',
  NEWS = 'NEWS',
  SPORTS = 'SPORTS',
  TRANSIT = 'TRANSIT',
  LINE_CHART = 'LINE_CHART',
  GAUGE = 'GAUGE',
  INDICATOR = 'INDICATOR',
  TEXT_DISPLAY = 'TEXT_DISPLAY',
  BAR_CHART = 'BAR_CHART',
  CUSTOM = 'CUSTOM'
}

export interface BaseWidgetConfig {
  title: string
  refreshInterval?: number
  deviceToken?: string
  dataSource?: 'device' | 'api' | 'static'
}

export interface WidgetConfig extends BaseWidgetConfig {
  [key: string]: any
}

export interface WidgetData {
  timestamp: number
  data: any
  error?: string
}

// IoT Device Widget Configurations
export interface LineChartConfig extends BaseWidgetConfig {
  type: 'LINE_CHART'
  dataField: string // JSON path like 'temperature' or 'sensors.temp'
  maxDataPoints: number
  yAxisLabel?: string
  xAxisLabel?: string
  lineColor?: string
  showGrid?: boolean
  minValue?: number
  maxValue?: number
}

export interface GaugeConfig extends BaseWidgetConfig {
  type: 'GAUGE'
  dataField: string
  minValue: number
  maxValue: number
  unit?: string
  thresholds?: {
    low: { value: number; color: string }
    medium: { value: number; color: string }
    high: { value: number; color: string }
  }
}

export interface IndicatorConfig extends BaseWidgetConfig {
  type: 'INDICATOR'
  dataField: string
  conditions: {
    condition: 'equals' | 'greater' | 'less' | 'between'
    value: number | string
    value2?: number // for 'between' condition
    color: string
    label: string
  }[]
  defaultColor?: string
  defaultLabel?: string
}

export interface TextDisplayConfig extends BaseWidgetConfig {
  type: 'TEXT_DISPLAY'
  dataField: string
  unit?: string
  prefix?: string
  suffix?: string
  decimals?: number
  fontSize?: 'small' | 'medium' | 'large' | 'xl'
  alignment?: 'left' | 'center' | 'right'
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