import React from 'react'
import { BaseWidget } from './BaseWidget'
import { WeatherWidgetConfig } from '@/types/widgets'
import { Cloud, CloudRain, Sun, CloudSnow, Wind } from 'lucide-react'

interface WeatherWidgetProps {
  id: string
  config: WeatherWidgetConfig
  data: any
  onRemove: () => void
  onConfigure: () => void
  onRefresh: () => void
  isLoading?: boolean
  error?: string
}

export function WeatherWidget({
  id,
  config,
  data,
  onRemove,
  onConfigure,
  onRefresh,
  isLoading,
  error,
}: WeatherWidgetProps) {
  const getWeatherIcon = (condition: string) => {
    switch (condition?.toLowerCase()) {
      case 'clear':
        return <Sun className="h-12 w-12 text-yellow-500" />
      case 'clouds':
        return <Cloud className="h-12 w-12 text-gray-400" />
      case 'rain':
        return <CloudRain className="h-12 w-12 text-blue-500" />
      case 'snow':
        return <CloudSnow className="h-12 w-12 text-blue-300" />
      default:
        return <Wind className="h-12 w-12 text-gray-400" />
    }
  }

  const renderContent = () => {
    if (!data) return null

    const { temperature, condition, humidity, windSpeed, forecast } = data

    if (config.displayMode === 'forecast' && forecast) {
      return (
        <div className="space-y-2">
          {forecast.slice(0, 3).map((day: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
              <span className="text-sm font-medium">{day.date}</span>
              <div className="flex items-center space-x-2">
                {getWeatherIcon(day.condition)}
                <span className="text-sm">{day.high}°/{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-lg font-semibold mb-2">{config.location}</h3>
        {getWeatherIcon(condition)}
        <p className="text-3xl font-bold mt-2">
          {temperature}°{config.units === 'metric' ? 'C' : 'F'}
        </p>
        <p className="text-sm text-muted-foreground capitalize mt-1">{condition}</p>
        {config.displayMode === 'detailed' && (
          <div className="mt-4 text-sm space-y-1">
            <p>Humidity: {humidity}%</p>
            <p>Wind: {windSpeed} {config.units === 'metric' ? 'km/h' : 'mph'}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <BaseWidget
      id={id}
      title={`Weather: ${config.location}`}
      onRemove={onRemove}
      onConfigure={onConfigure}
      onRefresh={onRefresh}
      isLoading={isLoading}
      error={error}
    >
      {renderContent()}
    </BaseWidget>
  )
}