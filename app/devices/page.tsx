'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Copy, Plus, Trash2, Wifi, WifiOff, Eye, EyeOff, Smartphone, Cpu, Monitor } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Device {
  id: string
  deviceName: string
  deviceType: 'ESP32_DISPLAY' | 'ARDUINO' | 'RASPBERRY_PI' | 'CUSTOM'
  apiToken: string
  mqttTopic: string
  lastSeen: string | null
  isActive: boolean
  createdAt: string
  deviceConfig: any
}

const deviceTypeIcons = {
  ESP32_DISPLAY: <Monitor className="w-4 h-4" />,
  ARDUINO: <Cpu className="w-4 h-4" />,
  RASPBERRY_PI: <Smartphone className="w-4 h-4" />,
  CUSTOM: <Cpu className="w-4 h-4" />
}

const deviceTypeLabels = {
  ESP32_DISPLAY: 'ESP32 Display',
  ARDUINO: 'Arduino',
  RASPBERRY_PI: 'Raspberry Pi',
  CUSTOM: 'Custom Device'
}

export default function DevicesPage() {
  const { user, getAuthHeaders } = useAuth()
  const [devices, setDevices] = useState<Device[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showTokenModal, setShowTokenModal] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null)
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set())

  // Form state for adding new device
  const [newDevice, setNewDevice] = useState({
    deviceName: '',
    deviceType: 'ESP32_DISPLAY' as Device['deviceType'],
    deviceConfig: {}
  })

  useEffect(() => {
    if (user) {
      fetchDevices()
    }
  }, [user])

  const fetchDevices = async () => {
    try {
      setIsLoading(true)
      // Mock devices for demo - replace with actual API call
      const mockDevices: Device[] = [
        {
          id: '1',
          deviceName: 'Living Room Sensor',
          deviceType: 'ESP32_DISPLAY',
          apiToken: '550e8400-e29b-41d4-a716-446655440001',
          mqttTopic: 'iot/550e8400-e29b-41d4-a716-446655440001/data',
          lastSeen: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          isActive: true,
          createdAt: new Date().toISOString(),
          deviceConfig: { location: 'Living Room', sensors: ['temperature', 'humidity'] }
        },
        {
          id: '2',
          deviceName: 'Garage Monitor',
          deviceType: 'ARDUINO',
          apiToken: '550e8400-e29b-41d4-a716-446655440002',
          mqttTopic: 'iot/550e8400-e29b-41d4-a716-446655440002/data',
          lastSeen: null,
          isActive: false,
          createdAt: new Date().toISOString(),
          deviceConfig: { location: 'Garage', sensors: ['motion', 'door'] }
        }
      ]
      setDevices(mockDevices)
    } catch (error) {
      console.error('Failed to fetch devices:', error)
      toast.error('Failed to load devices')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      // Mock API call - replace with actual implementation
      const newDeviceData: Device = {
        id: Date.now().toString(),
        deviceName: newDevice.deviceName,
        deviceType: newDevice.deviceType,
        apiToken: crypto.randomUUID(),
        mqttTopic: `iot/${crypto.randomUUID()}/data`,
        lastSeen: null,
        isActive: true,
        createdAt: new Date().toISOString(),
        deviceConfig: newDevice.deviceConfig
      }

      setDevices(prev => [newDeviceData, ...prev])
      setShowAddModal(false)
      setNewDevice({ deviceName: '', deviceType: 'ESP32_DISPLAY', deviceConfig: {} })
      toast.success('Device added successfully!')
      
      // Show the API token modal for the new device
      setSelectedDevice(newDeviceData)
      setShowTokenModal(true)
    } catch (error) {
      console.error('Failed to add device:', error)
      toast.error('Failed to add device')
    }
  }

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return

    try {
      // Mock API call - replace with actual implementation
      setDevices(prev => prev.filter(d => d.id !== deviceId))
      toast.success('Device deleted successfully!')
    } catch (error) {
      console.error('Failed to delete device:', error)
      toast.error('Failed to delete device')
    }
  }

  const toggleTokenVisibility = (deviceId: string) => {
    setVisibleTokens(prev => {
      const newSet = new Set(prev)
      if (newSet.has(deviceId)) {
        newSet.delete(deviceId)
      } else {
        newSet.add(deviceId)
      }
      return newSet
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const formatLastSeen = (lastSeen: string | null) => {
    if (!lastSeen) return 'Never'
    const date = new Date(lastSeen)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes} minutes ago`
    if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`
    return `${Math.floor(minutes / 1440)} days ago`
  }

  if (!user) {
    return <div>Please log in to manage devices</div>
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Device Management</h1>
            <p className="text-muted-foreground">Manage your IoT devices and API credentials</p>
          </div>
          <Button onClick={() => setShowAddModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Device
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">Loading devices...</div>
        ) : devices.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">No devices found</h3>
            <p className="text-muted-foreground mb-4">
              Add your first IoT device to get started
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Device
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {devices.map((device) => (
              <Card key={device.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {deviceTypeIcons[device.deviceType]}
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {device.deviceName}
                          {device.lastSeen ? (
                            <Wifi className="w-4 h-4 text-green-500" />
                          ) : (
                            <WifiOff className="w-4 h-4 text-red-500" />
                          )}
                        </CardTitle>
                        <CardDescription>
                          {deviceTypeLabels[device.deviceType]} • Last seen: {formatLastSeen(device.lastSeen)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={device.isActive ? 'default' : 'secondary'}>
                        {device.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedDevice(device)
                          setShowTokenModal(true)
                        }}
                      >
                        View Credentials
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDevice(device.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">API Token</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                          {visibleTokens.has(device.id) 
                            ? device.apiToken 
                            : '••••••••-••••-••••-••••-••••••••••••'
                          }
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleTokenVisibility(device.id)}
                        >
                          {visibleTokens.has(device.id) ? 
                            <EyeOff className="w-3 h-3" /> : 
                            <Eye className="w-3 h-3" />
                          }
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(device.apiToken, 'API Token')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">MQTT Topic</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded flex-1">
                          {device.mqttTopic}
                        </code>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(device.mqttTopic, 'MQTT Topic')}
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add Device Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDevice} className="space-y-4">
            <div>
              <Label htmlFor="deviceName">Device Name</Label>
              <Input
                id="deviceName"
                value={newDevice.deviceName}
                onChange={(e) => setNewDevice(prev => ({ ...prev, deviceName: e.target.value }))}
                placeholder="e.g., Living Room Sensor"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="deviceType">Device Type</Label>
              <Select
                value={newDevice.deviceType}
                onValueChange={(value: Device['deviceType']) => 
                  setNewDevice(prev => ({ ...prev, deviceType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ESP32_DISPLAY">ESP32 Display</SelectItem>
                  <SelectItem value="ARDUINO">Arduino</SelectItem>
                  <SelectItem value="RASPBERRY_PI">Raspberry Pi</SelectItem>
                  <SelectItem value="CUSTOM">Custom Device</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Device</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Device Credentials Modal */}
      <Dialog open={showTokenModal} onOpenChange={setShowTokenModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Device Credentials - {selectedDevice?.deviceName}</DialogTitle>
          </DialogHeader>
          
          {selectedDevice && (
            <div className="space-y-6">
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200">Important</h4>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  Store these credentials securely. You'll need them to configure your device.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">API Token</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-muted px-3 py-2 rounded flex-1 font-mono">
                      {selectedDevice.apiToken}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedDevice.apiToken, 'API Token')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Use this token in the X-Internal-API-Key header when sending data
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">MQTT Topic</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-muted px-3 py-2 rounded flex-1 font-mono">
                      {selectedDevice.mqttTopic}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedDevice.mqttTopic, 'MQTT Topic')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Publish sensor data to this MQTT topic
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium">API Endpoint</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="text-sm bg-muted px-3 py-2 rounded flex-1 font-mono">
                      POST /api/internal/data
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard('POST /api/internal/data', 'API Endpoint')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Send HTTP POST requests to this endpoint with your API token
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 dark:text-blue-200">Example Usage</h4>
                <pre className="text-xs text-blue-700 dark:text-blue-300 mt-2 overflow-x-auto">
{`curl -X POST https://your-domain.com/api/internal/data \\
  -H "Content-Type: application/json" \\
  -H "X-Internal-API-Key: ${selectedDevice.apiToken}" \\
  -d '{
    "deviceToken": "${selectedDevice.apiToken}",
    "topic": "${selectedDevice.mqttTopic}",
    "data": {
      "temperature": 25.5,
      "humidity": 60.2
    }
  }'`}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}