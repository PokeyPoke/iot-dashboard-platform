import React, { useState, useEffect } from 'react'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { BaseWidget } from './BaseWidget'
import { GaugeConfig } from '@/types/widgets'

interface WidgetProps {
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

export function GaugeWidget({ id, config, data: widgetData, title, dataField, onRemove, onConfigure, onRefresh, isLoading = false }: WidgetProps) {
  const [currentValue, setCurrentValue] = useState<number | null>(null)
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

  // Get color based on thresholds
  const getThresholdColor = (value: number): string => {
    if (!config.thresholds) return '#3b82f6'

    const { low, medium, high } = config.thresholds
    
    if (value <= low.value) return low.color
    if (value <= medium.value) return medium.color
    if (value <= high.value) return high.color
    
    return high.color
  }

  // Get threshold label
  const getThresholdLabel = (value: number): string => {
    if (!config.thresholds) return ''

    const { low, medium, high } = config.thresholds
    
    if (value <= low.value) return 'Low'
    if (value <= medium.value) return 'Normal'
    if (value <= high.value) return 'High'
    
    return 'Critical'
  }

  // Process data from props
  useEffect(() => {
    if (widgetData?.error) {
      setError(widgetData.error)
      setCurrentValue(null)
      return
    }

    if (widgetData && dataField) {
      const value = getNestedValue(widgetData, dataField)
      
      if (value !== null) {
        setCurrentValue(value)
        setError(null)
      } else {
        setError(`No data found for field: ${dataField}`)
      }
    } else {
      setCurrentValue(null)
    }
  }, [widgetData, dataField])

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  // Calculate percentage for gauge
  const percentage = currentValue !== null ? 
    ((currentValue - config.minValue) / (config.maxValue - config.minValue)) * 100 : 0

  const gaugeColor = currentValue !== null ? getThresholdColor(currentValue) : '#e5e7eb'
  const thresholdLabel = currentValue !== null ? getThresholdLabel(currentValue) : ''

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
      <div className="h-full flex flex-col items-center justify-center p-4">
        {currentValue !== null ? (
          <>
            <div className="w-32 h-32 mb-4">
              <CircularProgressbar
                value={Math.max(0, Math.min(100, percentage))}
                text={`${currentValue.toFixed(1)}${config.unit || ''}`}
                styles={buildStyles({
                  textColor: gaugeColor,
                  pathColor: gaugeColor,
                  trailColor: '#e5e7eb',
                  strokeLinecap: 'round',
                  textSize: '14px',
                  pathTransitionDuration: 0.5,
                })}
              />
            </div>
            
            <div className="text-center">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {dataField}
              </div>
              {thresholdLabel && (
                <div 
                  className="text-xs font-semibold mt-1 px-2 py-1 rounded"
                  style={{ 
                    backgroundColor: `${gaugeColor}20`,
                    color: gaugeColor
                  }}
                >
                  {thresholdLabel}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                Range: {config.minValue} - {config.maxValue}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <div className="w-32 h-32 mb-4 mx-auto">
              <CircularProgressbar
                value={0}
                text="--"
                styles={buildStyles({
                  textColor: '#9ca3af',
                  pathColor: '#e5e7eb',
                  trailColor: '#e5e7eb',
                  strokeLinecap: 'round',
                  textSize: '16px',
                })}
              />
            </div>
            Waiting for data...
          </div>
        )}
      </div>
    </BaseWidget>
  )
}