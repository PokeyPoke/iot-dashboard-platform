'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { StockWidget } from './widgets/StockWidget'
import { WeatherWidget } from './widgets/WeatherWidget'
import { WidgetConfigModal } from './widgets/WidgetConfigModal'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { StockService } from '@/services/stockService'
import { WeatherService } from '@/services/weatherService'
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

const ResponsiveGridLayout = WidthProvider(Responsive)

interface Widget {
  id: string
  type: string
  config: any
  x: number
  y: number
  w: number
  h: number
}

interface DashboardGridProps {
  widgets: Widget[]
  dashboardId: string
  onLayoutChange: (layout: any) => void
  onWidgetRemove: (widgetId: string) => void
  onWidgetUpdate: (widgetId: string, config: any) => void
  onAddWidget: () => void
}

export function DashboardGrid({
  widgets,
  dashboardId,
  onLayoutChange,
  onWidgetRemove,
  onWidgetUpdate,
  onAddWidget,
}: DashboardGridProps) {
  const [widgetData, setWidgetData] = useState<{ [key: string]: any }>({})
  const [loadingWidgets, setLoadingWidgets] = useState<{ [key: string]: boolean }>({})
  const [configModal, setConfigModal] = useState<{
    isOpen: boolean
    widgetId?: string
    widgetType?: string
    config?: any
  }>({ isOpen: false })

  // Auto-refresh widgets on mount and config changes
  useEffect(() => {
    widgets.forEach(widget => {
      handleRefresh(widget.id)
    })
  }, [widgets.length])

  // Set up auto-refresh intervals
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = []
    
    widgets.forEach(widget => {
      const interval = setInterval(() => {
        handleRefresh(widget.id)
      }, 300000) // Refresh every 5 minutes
      intervals.push(interval)
    })

    return () => {
      intervals.forEach(clearInterval)
    }
  }, [widgets, handleRefresh])

  const handleRefresh = useCallback(async (widgetId: string) => {
    setLoadingWidgets(prev => ({ ...prev, [widgetId]: true }))
    
    const widget = widgets.find(w => w.id === widgetId)
    if (widget) {
      try {
        let data
        
        switch (widget.type) {
          case 'STOCK':
            const stockService = StockService.getInstance()
            data = await stockService.getStockData(widget.config.symbol || 'AAPL')
            break
          case 'WEATHER':
            const weatherService = WeatherService.getInstance()
            data = await weatherService.getWeatherData(
              widget.config.location || 'New York',
              widget.config.units || 'metric'
            )
            break
          default:
            data = {}
        }
        
        setWidgetData(prev => ({ ...prev, [widgetId]: data }))
      } catch (error) {
        console.error(`Error refreshing widget ${widgetId}:`, error)
        setWidgetData(prev => ({ 
          ...prev, 
          [widgetId]: { error: 'Failed to load data' } 
        }))
      }
    }
    
    setLoadingWidgets(prev => ({ ...prev, [widgetId]: false }))
  }, [widgets])

  const renderWidget = (widget: Widget) => {
    const commonProps = {
      id: widget.id,
      config: widget.config,
      data: widgetData[widget.id],
      onRemove: () => onWidgetRemove(widget.id),
      onConfigure: () => setConfigModal({
        isOpen: true,
        widgetId: widget.id,
        widgetType: widget.type,
        config: widget.config
      }),
      onRefresh: () => handleRefresh(widget.id),
      isLoading: loadingWidgets[widget.id],
    }

    switch (widget.type) {
      case 'STOCK':
        return <StockWidget {...commonProps} />
      case 'WEATHER':
        return <WeatherWidget {...commonProps} />
      default:
        return <div>Unknown widget type</div>
    }
  }

  const layouts = {
    lg: widgets.map(w => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h })),
    md: widgets.map(w => ({ i: w.id, x: w.x, y: w.y, w: w.w, h: w.h })),
    sm: widgets.map(w => ({ i: w.id, x: 0, y: w.y, w: 6, h: w.h })),
    xs: widgets.map(w => ({ i: w.id, x: 0, y: w.y, w: 4, h: w.h })),
  }

  return (
    <div className="dashboard-grid">
      {widgets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No widgets added yet</p>
          <Button onClick={onAddWidget}>
            <Plus className="mr-2 h-4 w-4" />
            Add Widget
          </Button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <Button onClick={onAddWidget}>
              <Plus className="mr-2 h-4 w-4" />
              Add Widget
            </Button>
          </div>
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={(layout, layouts) => {
              onLayoutChange(layouts)
              // Persist layout changes to API
              fetch('/api/widgets/layout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ dashboardId, layouts }),
              })
            }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4 }}
            rowHeight={100}
            isDraggable
            isResizable
            containerPadding={[0, 0]}
            margin={[16, 16]}
          >
            {widgets.map(widget => (
              <div key={widget.id} className="widget-grid-item">
                {renderWidget(widget)}
              </div>
            ))}
          </ResponsiveGridLayout>
        </>
      )}
      
      <WidgetConfigModal
        isOpen={configModal.isOpen}
        onClose={() => setConfigModal({ isOpen: false })}
        widgetType={configModal.widgetType}
        config={configModal.config}
        onSave={(config) => {
          if (configModal.widgetId) {
            onWidgetUpdate(configModal.widgetId, config)
          }
        }}
      />
      )}
    </div>
  )
}