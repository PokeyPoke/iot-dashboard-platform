import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BaseWidget } from './BaseWidget'
import { LineChartConfig } from '@/types/widgets'

interface LineChartWidgetProps {
  id: string
  config: any
  data?: any
  title: string
  dataField?: string
  onRemove: () => void
  onConfigure: () => void
  onRefresh?: () => void
  isLoading?: boolean
}

interface DataPoint {
  timestamp: string
  value: number
  formattedTime: string
}

export function LineChartWidget({ id, config, data: widgetData, title, dataField, onRemove, onConfigure, onRefresh, isLoading = false }: LineChartWidgetProps) {
  const [chartData, setChartData] = useState<DataPoint[]>([])
  const [error, setError] = useState<string | null>(null)

  // Helper function to extract nested values from JSON
  const getNestedValue = (obj: any, path: string): number | null => {
    try {
      const value = path.split('.').reduce((current, key) => current?.[key], obj)
      const numValue = parseFloat(value)
      return isNaN(numValue) ? null : numValue
    } catch {
      return null
    }
  }

  // Process incoming data from DashboardGrid
  useEffect(() => {
    if (!widgetData || !dataField) return

    if (widgetData.error) {
      setError(widgetData.error)
      return
    }

    setError(null)

    // Process historical data if available
    if (widgetData.history && Array.isArray(widgetData.history)) {
      const processedData = widgetData.history.map((point: any) => {
        const value = getNestedValue(point, dataField)
        return {
          timestamp: point.timestamp || new Date().toISOString(),
          value: value || 0,
          formattedTime: new Date(point.timestamp || Date.now()).toLocaleTimeString()
        }
      }).filter((point: DataPoint) => point.value !== null)
      
      setChartData(processedData)
    } else {
      // Use current value if no history available
      const currentValue = getNestedValue(widgetData.data || widgetData, dataField)
      if (currentValue !== null) {
        const newPoint: DataPoint = {
          timestamp: widgetData.timestamp || new Date().toISOString(),
          value: currentValue,
          formattedTime: new Date().toLocaleTimeString()
        }

        setChartData(prev => {
          const newData = [...prev, newPoint]
          const maxPoints = config.maxDataPoints || 50
          return newData.slice(-maxPoints)
        })
      }
    }
  }, [widgetData, dataField, config.maxDataPoints])

  const handleRefresh = () => {
    setChartData([])
    setError(null)
    if (onRefresh) onRefresh()
  }

  return (
    <BaseWidget
      id={id}
      title={title}
      onRemove={onRemove}
      onConfigure={onConfigure}
      onRefresh={handleRefresh}
      isLoading={isLoading}
      error={error || undefined}
    >
      <div className="h-full flex flex-col">
        {chartData.length === 0 && !error ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Waiting for data from device...
          </div>
        ) : (
          <>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  {config.showGrid && <CartesianGrid strokeDasharray="3 3" />}
                  <XAxis 
                    dataKey="formattedTime"
                    tick={{ fontSize: 12 }}
                    label={config.xAxisLabel ? { value: config.xAxisLabel, position: 'insideBottom', offset: -5 } : undefined}
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    domain={config.minValue !== undefined && config.maxValue !== undefined ? 
                      [config.minValue, config.maxValue] : 
                      ['dataMin - 5', 'dataMax + 5']
                    }
                    label={config.yAxisLabel ? { value: config.yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
                  />
                  <Tooltip 
                    labelFormatter={(value) => `Time: ${value}`}
                    formatter={(value: number) => [value.toFixed(2), dataField || 'value']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={config.lineColor || '#3b82f6'}
                    strokeWidth={2}
                    dot={{ fill: config.lineColor || '#3b82f6', strokeWidth: 2, r: 3 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            {chartData.length > 0 && (
              <div className="text-xs text-muted-foreground text-center pt-2">
                Latest: {chartData[chartData.length - 1]?.value.toFixed(2)} | 
                Points: {chartData.length}/{config.maxDataPoints || 50}
              </div>
            )}
          </>
        )}
      </div>
    </BaseWidget>
  )
}