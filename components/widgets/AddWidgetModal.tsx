'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AddWidgetModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (type: string, config: any) => void
}

export function AddWidgetModal({
  isOpen,
  onClose,
  onAdd,
}: AddWidgetModalProps) {
  const [widgetType, setWidgetType] = useState<string>('')
  const [config, setConfig] = useState<any>({})

  const handleAdd = () => {
    if (widgetType) {
      onAdd(widgetType, config)
      setWidgetType('')
      setConfig({})
      onClose()
    }
  }

  const renderConfigFields = () => {
    switch (widgetType) {
      case 'STOCK':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="symbol">Stock Symbol</Label>
              <Input
                id="symbol"
                value={config.symbol || ''}
                onChange={(e) => setConfig({ ...config, symbol: e.target.value })}
                placeholder="e.g., AAPL"
              />
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={config.displayName || ''}
                onChange={(e) => setConfig({ ...config, displayName: e.target.value })}
                placeholder="e.g., Apple Inc."
              />
            </div>
          </div>
        )
      
      case 'WEATHER':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={config.location || ''}
                onChange={(e) => setConfig({ ...config, location: e.target.value })}
                placeholder="e.g., New York, NY"
              />
            </div>
            <div>
              <Label htmlFor="units">Units</Label>
              <Select
                value={config.units || 'metric'}
                onValueChange={(value) => setConfig({ ...config, units: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Celsius</SelectItem>
                  <SelectItem value="imperial">Fahrenheit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Widget</DialogTitle>
          <DialogDescription>
            Choose a widget type and configure its settings.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="widgetType">Widget Type</Label>
            <Select value={widgetType} onValueChange={setWidgetType}>
              <SelectTrigger>
                <SelectValue placeholder="Select widget type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="STOCK">Stock Tracker</SelectItem>
                <SelectItem value="WEATHER">Weather</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {widgetType && renderConfigFields()}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAdd} disabled={!widgetType}>
            Add Widget
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}