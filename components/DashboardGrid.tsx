'use client'

import React, { useState, useCallback } from 'react'
import { Responsive, WidthProvider } from 'react-grid-layout'
import { StockWidget } from './widgets/StockWidget'
import { WeatherWidget } from './widgets/WeatherWidget'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
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
  onLayoutChange: (layout: any) => void
  onWidgetRemove: (widgetId: string) => void
  onWidgetConfigure: (widgetId: string) => void
  onAddWidget: () => void
}

export function DashboardGrid({
  widgets,
  onLayoutChange,
  onWidgetRemove,
  onWidgetConfigure,
  onAddWidget,
}: DashboardGridProps) {
  const [widgetData, setWidgetData] = useState<{ [key: string]: any }>({})
  const [loadingWidgets, setLoadingWidgets] = useState<{ [key: string]: boolean }>({})

  const handleRefresh = useCallback(async (widgetId: string) => {
    setLoadingWidgets(prev => ({ ...prev, [widgetId]: true }))
    
    // Simulate data fetching
    setTimeout(() => {
      const widget = widgets.find(w => w.id === widgetId)
      if (widget) {
        let mockData
        
        switch (widget.type) {
          case 'STOCK':
            mockData = {
              symbol: widget.config.symbol,
              price: 150 + Math.random() * 10,
              change: (Math.random() - 0.5) * 5,
              changePercent: (Math.random() - 0.5) * 3,
            }
            break
          case 'WEATHER':
            mockData = {
              location: widget.config.location,
              temperature: Math.round(20 + Math.random() * 10),
              condition: ['Clear', 'Clouds', 'Rain'][Math.floor(Math.random() * 3)],
              humidity: Math.round(40 + Math.random() * 40),
              windSpeed: Math.round(5 + Math.random() * 15),
            }
            break
          default:
            mockData = {}
        }
        
        setWidgetData(prev => ({ ...prev, [widgetId]: mockData }))
      }
      
      setLoadingWidgets(prev => ({ ...prev, [widgetId]: false }))
    }, 1000)
  }, [widgets])

  const renderWidget = (widget: Widget) => {
    const commonProps = {
      id: widget.id,
      config: widget.config,
      data: widgetData[widget.id],
      onRemove: () => onWidgetRemove(widget.id),
      onConfigure: () => onWidgetConfigure(widget.id),
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
            onLayoutChange={(layout, layouts) => onLayoutChange(layouts)}
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
    </div>
  )
}