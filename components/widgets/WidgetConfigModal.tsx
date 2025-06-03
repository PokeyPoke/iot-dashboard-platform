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

interface WidgetConfigModalProps {
  isOpen: boolean
  onClose: () => void
  widgetType?: string
  config?: any
  onSave: (config: any) => void
}

export function WidgetConfigModal({
  isOpen,
  onClose,
  widgetType,
  config = {},
  onSave,
}: WidgetConfigModalProps) {
  const [formData, setFormData] = useState(config)

  const handleSave = () => {
    onSave(formData)
    onClose()
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
                value={formData.symbol || ''}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                placeholder="e.g., AAPL"
              />
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={formData.displayName || ''}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
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
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., New York, NY"
              />
            </div>
            <div>
              <Label htmlFor="units">Units</Label>
              <Select
                value={formData.units || 'metric'}
                onValueChange={(value) => setFormData({ ...formData, units: value })}
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
        return (
          <div className="text-center text-muted-foreground">
            No configuration options available for this widget type.
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Widget</DialogTitle>
          <DialogDescription>
            Customize the settings for your {widgetType?.toLowerCase()} widget.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          {renderConfigFields()}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}