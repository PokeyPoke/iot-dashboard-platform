'use client'

import { useState, useEffect } from 'react'
import { DashboardGrid } from '@/components/DashboardGrid'
import { AddWidgetModal } from '@/components/widgets/AddWidgetModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [widgets, setWidgets] = useState<any[]>([])
  const [dashboardId, setDashboardId] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate login and dashboard creation
    setIsAuthenticated(true)
    
    // Create or get default dashboard
    try {
      const response = await fetch('/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'My Dashboard' }),
      })
      
      if (response.ok) {
        const { dashboard } = await response.json()
        setDashboardId(dashboard.id)
        loadWidgets(dashboard.id)
      }
    } catch (error) {
      // For demo purposes, use mock dashboard
      setDashboardId('demo-dashboard')
    }
  }
  
  const loadWidgets = async (dashId: string) => {
    try {
      const response = await fetch(`/api/widgets?dashboardId=${dashId}`)
      if (response.ok) {
        const { widgets } = await response.json()
        setWidgets(widgets)
      }
    } catch (error) {
      console.error('Failed to load widgets:', error)
    }
  }

  const handleAddWidget = async (type: string, config: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboardId,
          type,
          config,
          x: 0,
          y: 0,
          w: 4,
          h: 3,
        }),
      })
      
      if (response.ok) {
        const { widget } = await response.json()
        setWidgets([...widgets, widget])
        toast.success('Widget added successfully')
      } else {
        toast.error('Failed to add widget')
      }
    } catch (error) {
      console.error('Failed to add widget:', error)
      toast.error('Failed to add widget')
    }
    setLoading(false)
  }

  const handleLayoutChange = (layouts: any) => {
    // Update widget positions based on new layout
    console.log('Layout changed:', layouts)
  }

  const handleWidgetRemove = async (widgetId: string) => {
    try {
      const response = await fetch(`/api/widgets/${widgetId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        setWidgets(widgets.filter(w => w.id !== widgetId))
        toast.success('Widget removed')
      } else {
        toast.error('Failed to remove widget')
      }
    } catch (error) {
      console.error('Failed to remove widget:', error)
      toast.error('Failed to remove widget')
    }
  }

  const handleWidgetUpdate = async (widgetId: string, config: any) => {
    try {
      const response = await fetch(`/api/widgets/${widgetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      
      if (response.ok) {
        const { widget } = await response.json()
        setWidgets(widgets.map(w => w.id === widgetId ? widget : w))
        toast.success('Widget updated')
      } else {
        toast.error('Failed to update widget')
      }
    } catch (error) {
      console.error('Failed to update widget:', error)
      toast.error('Failed to update widget')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Welcome to IoT Dashboard</CardTitle>
            <CardDescription>
              Sign in to access your personalized dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" className="w-full">
                  Sign In
                </Button>
                <Button type="button" variant="outline" className="w-full">
                  Sign Up
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">IoT Dashboard Platform</h1>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push('/devices')}>
              Manage Devices
            </Button>
            <Button variant="outline" onClick={() => setIsAuthenticated(false)}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">My Dashboard</h2>
          <p className="text-muted-foreground">
            Drag and drop widgets to customize your dashboard
          </p>
        </div>
        
        <DashboardGrid
          widgets={widgets}
          dashboardId={dashboardId}
          onLayoutChange={handleLayoutChange}
          onWidgetRemove={handleWidgetRemove}
          onWidgetUpdate={handleWidgetUpdate}
          onAddWidget={() => setShowAddModal(true)}
        />
        
        <AddWidgetModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddWidget}
        />
      </main>
    </div>
  )
}