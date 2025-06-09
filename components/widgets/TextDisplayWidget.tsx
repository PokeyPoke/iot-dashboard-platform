import React, { useState, useEffect } from 'react'
import { BaseWidget } from './BaseWidget'
import { TextDisplayConfig } from '@/types/widgets'
import { cn } from '@/lib/utils'

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

export function TextDisplayWidget({ id, config, data: widgetData, title, dataField, onRemove, onConfigure, onRefresh, isLoading = false }: WidgetProps) {
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

  // Format the display value
  const formatValue = (value: number | string): string => {
    let formatted = String(value)
    
    // Apply decimal formatting for numbers
    if (typeof value === 'number' && config.decimals !== undefined) {
      formatted = value.toFixed(config.decimals)
    }
    
    // Add prefix and suffix
    const prefix = config.prefix || ''
    const suffix = config.suffix || ''
    const unit = config.unit || ''
    
    return `${prefix}${formatted}${unit}${suffix}`
  }

  // Get font size classes
  const getFontSizeClass = () => {
    switch (config.fontSize) {
      case 'small': return 'text-lg'
      case 'medium': return 'text-2xl'
      case 'large': return 'text-4xl'
      case 'xl': return 'text-6xl'
      default: return 'text-2xl'
    }
  }

  // Get alignment classes
  const getAlignmentClass = () => {
    switch (config.alignment) {
      case 'left': return 'text-left'
      case 'center': return 'text-center'
      case 'right': return 'text-right'
      default: return 'text-center'
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
      <div className="h-full flex flex-col justify-center p-6">
        {currentValue !== null ? (
          <>
            <div className={cn(
              "font-bold text-primary mb-2",
              getFontSizeClass(),
              getAlignmentClass()
            )}>
              {formatValue(currentValue)}
            </div>
            
            <div className={cn(
              "text-sm text-muted-foreground",
              getAlignmentClass()
            )}>
              {dataField}
            </div>
            
            <div className={cn(
              "text-xs text-muted-foreground mt-2",
              getAlignmentClass()
            )}>
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </>
        ) : (
          <div className={cn(
            "text-muted-foreground",
            getAlignmentClass()
          )}>
            <div className={cn("mb-2", getFontSizeClass())}>
              --
            </div>
            <div className="text-sm">
              Waiting for data...
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  )
}