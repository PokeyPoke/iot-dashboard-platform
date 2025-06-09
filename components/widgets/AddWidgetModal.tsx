'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { BarChart3, Gauge, Eye, Type, TrendingUp, CloudSun } from 'lucide-react'
import { WidgetType, WidgetConfig } from '@/types/widgets'

interface AddWidgetModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (type: string, config: any) => void
}

interface Device {
  id: string
  deviceName: string
  apiToken: string
  deviceType: string
  isActive: boolean
}

export function AddWidgetModal({ isOpen, onClose, onAdd }: AddWidgetModalProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [config, setConfig] = useState<Partial<WidgetConfig>>({})
  const [devices, setDevices] = useState<Device[]>([])
  const [step, setStep] = useState<'type' | 'config'>('type')

  const widgetCategories = {
    'IoT Devices': [
      { 
        value: WidgetType.LINE_CHART, 
        label: 'Line Chart', 
        description: 'Track sensor values over time',
        icon: <TrendingUp className="w-4 h-4" />
      },
      { 
        value: WidgetType.GAUGE, 
        label: 'Gauge', 
        description: 'Display single values with thresholds',
        icon: <Gauge className="w-4 h-4" />
      },
      { 
        value: WidgetType.INDICATOR, 
        label: 'Status Indicator', 
        description: 'Show status with colors and icons',
        icon: <Eye className="w-4 h-4" />
      },
      { 
        value: WidgetType.TEXT_DISPLAY, 
        label: 'Text Display', 
        description: 'Show values as formatted text',
        icon: <Type className="w-4 h-4" />
      },
      { 
        value: WidgetType.BAR_CHART, 
        label: 'Bar Chart', 
        description: 'Compare multiple values',
        icon: <BarChart3 className="w-4 h-4" />
      },
    ],
    'External APIs': [
      { 
        value: WidgetType.STOCK, 
        label: 'Stock Price', 
        description: 'Real-time stock market data',
        icon: <TrendingUp className="w-4 h-4" />
      },
      { 
        value: WidgetType.WEATHER, 
        label: 'Weather', 
        description: 'Current weather conditions',
        icon: <CloudSun className="w-4 h-4" />
      },
    ]
  }

  // Fetch user devices
  useEffect(() => {
    if (isOpen) {
      fetchDevices()
    }
  }, [isOpen])

  const fetchDevices = async () => {
    try {
      // This would be replaced with actual API call
      const mockDevices: Device[] = [
        { id: '1', deviceName: 'Temperature Sensor', apiToken: 'token1', deviceType: 'ESP32_DISPLAY', isActive: true },
        { id: '2', deviceName: 'Humidity Monitor', apiToken: 'token2', deviceType: 'ARDUINO', isActive: true },
        { id: '3', deviceName: 'Motion Detector', apiToken: 'token3', deviceType: 'RASPBERRY_PI', isActive: false },
      ]
      setDevices(mockDevices)
    } catch (error) {
      console.error('Failed to fetch devices:', error)
    }
  }

  const handleTypeSelect = (type: string) => {
    setSelectedType(type)
    setConfig({ 
      title: `New ${widgetCategories['IoT Devices'].find(w => w.value === type)?.label || widgetCategories['External APIs'].find(w => w.value === type)?.label}`,
      type: type as WidgetType,
      refreshInterval: 5
    })
    setStep('config')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (selectedType && config.title) {
      onAdd(selectedType, config)
      handleClose()
    }
  }

  const handleClose = () => {
    onClose()
    setSelectedType('')
    setConfig({})
    setStep('type')
  }

  const isIoTWidget = ['LINE_CHART', 'GAUGE', 'INDICATOR', 'TEXT_DISPLAY', 'BAR_CHART'].includes(selectedType)

  const renderConfigFields = () => {
    if (!selectedType) return null

    const baseFields = (
      <>
        <div>
          <Label htmlFor="title">Widget Title</Label>
          <Input
            id="title"
            placeholder="Enter widget title"
            value={config.title || ''}
            onChange={(e) => setConfig({ ...config, title: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
          <Select 
            value={String(config.refreshInterval || 5)} 
            onValueChange={(value) => setConfig({ ...config, refreshInterval: parseInt(value) })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 second</SelectItem>
              <SelectItem value="5">5 seconds</SelectItem>
              <SelectItem value="10">10 seconds</SelectItem>
              <SelectItem value="30">30 seconds</SelectItem>
              <SelectItem value="60">1 minute</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </>
    )

    const iotFields = isIoTWidget && (
      <>
        <div>
          <Label htmlFor="device">Device</Label>
          <Select 
            value={config.deviceToken || ''} 
            onValueChange={(value) => setConfig({ ...config, deviceToken: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select device" />
            </SelectTrigger>
            <SelectContent>
              {devices.filter(d => d.isActive).map((device) => (
                <SelectItem key={device.id} value={device.apiToken}>
                  <div className="flex items-center gap-2">
                    {device.deviceName}
                    <Badge variant="secondary">{device.deviceType}</Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="dataField">Data Field</Label>
          <Input
            id="dataField"
            placeholder="e.g., temperature, sensors.humidity, status"
            value={(config as any).dataField || ''}
            onChange={(e) => setConfig({ ...config, dataField: e.target.value })}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Use dot notation for nested fields (e.g., sensors.temperature)
          </p>
        </div>
      </>
    )

    switch (selectedType) {
      case WidgetType.LINE_CHART:
        return (
          <div className="space-y-4">
            {baseFields}
            {iotFields}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="maxDataPoints">Max Data Points</Label>
                <Input
                  id="maxDataPoints"
                  type="number"
                  placeholder="50"
                  value={(config as any).maxDataPoints || ''}
                  onChange={(e) => setConfig({ ...config, maxDataPoints: parseInt(e.target.value) || 50 })}
                />
              </div>
              <div>
                <Label htmlFor="lineColor">Line Color</Label>
                <Input
                  id="lineColor"
                  type="color"
                  value={(config as any).lineColor || '#3b82f6'}
                  onChange={(e) => setConfig({ ...config, lineColor: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yAxisLabel">Y-Axis Label</Label>
                <Input
                  id="yAxisLabel"
                  placeholder="Temperature (°C)"
                  value={(config as any).yAxisLabel || ''}
                  onChange={(e) => setConfig({ ...config, yAxisLabel: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="xAxisLabel">X-Axis Label</Label>
                <Input
                  id="xAxisLabel"
                  placeholder="Time"
                  value={(config as any).xAxisLabel || ''}
                  onChange={(e) => setConfig({ ...config, xAxisLabel: e.target.value })}
                />
              </div>
            </div>
          </div>
        )

      case WidgetType.GAUGE:
        return (
          <div className="space-y-4">
            {baseFields}
            {iotFields}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="minValue">Min Value</Label>
                <Input
                  id="minValue"
                  type="number"
                  placeholder="0"
                  value={(config as any).minValue || ''}
                  onChange={(e) => setConfig({ ...config, minValue: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="maxValue">Max Value</Label>
                <Input
                  id="maxValue"
                  type="number"
                  placeholder="100"
                  value={(config as any).maxValue || ''}
                  onChange={(e) => setConfig({ ...config, maxValue: parseFloat(e.target.value) || 100 })}
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  placeholder="°C"
                  value={(config as any).unit || ''}
                  onChange={(e) => setConfig({ ...config, unit: e.target.value })}
                />
              </div>
            </div>
          </div>
        )

      case WidgetType.STOCK:
        return (
          <div className="space-y-4">
            {baseFields}
            <div>
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                placeholder="AAPL"
                value={(config as any).symbol || ''}
                onChange={(e) => setConfig({ ...config, symbol: e.target.value.toUpperCase() })}
                required
              />
            </div>
          </div>
        )

      case WidgetType.WEATHER:
        return (
          <div className="space-y-4">
            {baseFields}
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="New York, NY"
                value={(config as any).location || ''}
                onChange={(e) => setConfig({ ...config, location: e.target.value })}
                required
              />
            </div>
          </div>
        )

      default:
        return <div className="space-y-4">{baseFields}</div>
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {step === 'type' ? 'Choose Widget Type' : `Configure ${selectedType} Widget`}
          </DialogTitle>
        </DialogHeader>

        {step === 'type' ? (
          <Tabs defaultValue="iot" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="iot">IoT Devices</TabsTrigger>
              <TabsTrigger value="external">External APIs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="iot" className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {widgetCategories['IoT Devices'].map((widget) => (
                  <Button
                    key={widget.value}
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => handleTypeSelect(widget.value)}
                  >
                    <div className="flex items-start gap-3">
                      {widget.icon}
                      <div className="text-left">
                        <div className="font-medium">{widget.label}</div>
                        <div className="text-sm text-muted-foreground">{widget.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="external" className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {widgetCategories['External APIs'].map((widget) => (
                  <Button
                    key={widget.value}
                    variant="outline"
                    className="h-auto p-4 justify-start"
                    onClick={() => handleTypeSelect(widget.value)}
                  >
                    <div className="flex items-start gap-3">
                      {widget.icon}
                      <div className="text-left">
                        <div className="font-medium">{widget.label}</div>
                        <div className="text-sm text-muted-foreground">{widget.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {renderConfigFields()}
            
            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" onClick={() => setStep('type')}>
                Back
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedType || !config.title}>
                  Add Widget
                </Button>
              </div>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}