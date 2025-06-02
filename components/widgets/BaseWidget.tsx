import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Settings, X, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BaseWidgetProps {
  id: string
  title: string
  children: React.ReactNode
  onRemove: () => void
  onConfigure: () => void
  onRefresh: () => void
  isLoading?: boolean
  error?: string
  className?: string
}

export function BaseWidget({
  id,
  title,
  children,
  onRemove,
  onConfigure,
  onRefresh,
  isLoading = false,
  error,
  className,
}: BaseWidgetProps) {
  return (
    <Card className={cn("widget-container h-full", className)}>
      <CardHeader className="widget-header flex flex-row items-center justify-between space-y-0 p-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onConfigure}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="widget-content p-4">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}