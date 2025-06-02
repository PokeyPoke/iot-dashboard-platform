import React from 'react'
import { BaseWidget } from './BaseWidget'
import { StockWidgetConfig } from '@/types/widgets'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface StockWidgetProps {
  id: string
  config: StockWidgetConfig
  data: any
  onRemove: () => void
  onConfigure: () => void
  onRefresh: () => void
  isLoading?: boolean
  error?: string
}

export function StockWidget({
  id,
  config,
  data,
  onRemove,
  onConfigure,
  onRefresh,
  isLoading,
  error,
}: StockWidgetProps) {
  const renderContent = () => {
    if (!data) return null

    const { price, change, changePercent, chartData } = data

    if (config.displayMode === 'chart' && chartData) {
      return (
        <div className="h-full">
          <div className="mb-2">
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold">${price?.toFixed(2)}</span>
              <div className={cn("flex items-center", change >= 0 ? "text-green-500" : "text-red-500")}>
                {change >= 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
                <span className="text-sm font-medium">
                  {change >= 0 ? '+' : ''}{changePercent?.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="price" stroke="#8884d8" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )
    }

    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h3 className="text-lg font-semibold mb-1">{config.symbol}</h3>
        <p className="text-3xl font-bold mb-2">${price?.toFixed(2)}</p>
        <div className={cn("flex items-center", change >= 0 ? "text-green-500" : "text-red-500")}>
          {change >= 0 ? <TrendingUp className="h-5 w-5 mr-1" /> : <TrendingDown className="h-5 w-5 mr-1" />}
          <span className="text-lg font-medium">
            {change >= 0 ? '+' : ''}{change?.toFixed(2)} ({changePercent?.toFixed(2)}%)
          </span>
        </div>
      </div>
    )
  }

  return (
    <BaseWidget
      id={id}
      title={`Stock: ${config.symbol}`}
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ')
}