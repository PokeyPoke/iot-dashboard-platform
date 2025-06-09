import React, { useState, useEffect } from 'react'
import { BaseWidget } from './BaseWidget'
import { IndicatorConfig } from '@/types/widgets'
import { CheckCircle, XCircle, AlertCircle, Minus } from 'lucide-react'

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

export function IndicatorWidget({ id, config, data: widgetData, title, dataField, onRemove, onConfigure, onRefresh, isLoading = false }: WidgetProps) {
  const [currentValue, setCurrentValue] = useState<number | string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Helper function to extract nested values from JSON
  const getNestedValue = (obj: any, path: string): any => {
    try {
      return path.split('.').reduce((current, key) => current?.[key], obj)
    } catch {
      return null
    }
  }

  // Evaluate conditions to determine current state
  const evaluateConditions = (value: number | string) => {
    for (const condition of config.conditions) {
      const numericValue = typeof value === 'number' ? value : parseFloat(value.toString())
      const conditionValue = typeof condition.value === 'number' ? condition.value : parseFloat(condition.value.toString())
      
      switch (condition.condition) {
        case 'equals':
          if (value === condition.value) return condition
          break
        case 'greater':
          if (!isNaN(numericValue) && !isNaN(conditionValue) && numericValue > conditionValue) return condition
          break
        case 'less':
          if (!isNaN(numericValue) && !isNaN(conditionValue) && numericValue < conditionValue) return condition
          break
        case 'between':
          if (condition.value2 !== undefined) {
            const conditionValue2 = typeof condition.value2 === 'number' ? condition.value2 : parseFloat(condition.value2.toString())
            if (!isNaN(numericValue) && !isNaN(conditionValue) && !isNaN(conditionValue2) && 
                numericValue >= Math.min(conditionValue, conditionValue2) && 
                numericValue <= Math.max(conditionValue, conditionValue2)) {
              return condition
            }
          }
          break
      }
    }
    return null
  }

  // Get icon based on color
  const getStatusIcon = (color: string) => {
    const iconProps = { size: 24, strokeWidth: 2 }
    
    switch (color.toLowerCase()) {
      case '#22c55e':
      case '#10b981':
      case 'green':
        return <CheckCircle {...iconProps} />
      case '#ef4444':
      case '#f87171':
      case 'red':
        return <XCircle {...iconProps} />
      case '#f59e0b':
      case '#fbbf24':
      case 'yellow':
      case 'orange':
        return <AlertCircle {...iconProps} />
      default:
        return <Minus {...iconProps} />
    }
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
      
      if (value !== null && value !== undefined) {
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

  const activeCondition = currentValue !== null ? evaluateConditions(currentValue) : null
  const displayColor = activeCondition?.color || config.defaultColor || '#6b7280'
  const displayLabel = activeCondition?.label || config.defaultLabel || 'Unknown'

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
      <div className="h-full flex flex-col items-center justify-center p-6">
        {currentValue !== null ? (
          <>
            <div 
              className="mb-4 p-4 rounded-full transition-all duration-300"
              style={{ 
                backgroundColor: `${displayColor}20`,
                color: displayColor,
                border: `2px solid ${displayColor}`
              }}
            >
              {getStatusIcon(displayColor)}
            </div>
            
            <div className="text-center">
              <div 
                className="text-lg font-bold mb-2"
                style={{ color: displayColor }}
              >
                {displayLabel}
              </div>
              
              <div className="text-sm text-muted-foreground mb-2">
                {dataField}: {String(currentValue)}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-sm text-muted-foreground">
            <div className="mb-4 p-4 rounded-full bg-gray-100 dark:bg-gray-800">
              <Minus size={24} className="text-gray-400" />
            </div>
            Waiting for data...
          </div>
        )}
      </div>
    </BaseWidget>
  )
}