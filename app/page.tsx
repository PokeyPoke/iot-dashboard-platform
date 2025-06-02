'use client'

import { useState } from 'react'
import { DashboardGrid } from '@/components/DashboardGrid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [widgets, setWidgets] = useState<any[]>([])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    // Implement login logic
    setIsAuthenticated(true)
  }

  const handleAddWidget = () => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      type: Math.random() > 0.5 ? 'STOCK' : 'WEATHER',
      config: {
        symbol: 'AAPL',
        location: 'New York',
        units: 'metric',
      },
      x: 0,
      y: 0,
      w: 4,
      h: 3,
    }
    setWidgets([...widgets, newWidget])
  }

  const handleLayoutChange = (layouts: any) => {
    // Update widget positions based on new layout
    console.log('Layout changed:', layouts)
  }

  const handleWidgetRemove = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId))
  }

  const handleWidgetConfigure = (widgetId: string) => {
    console.log('Configure widget:', widgetId)
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
          onLayoutChange={handleLayoutChange}
          onWidgetRemove={handleWidgetRemove}
          onWidgetConfigure={handleWidgetConfigure}
          onAddWidget={handleAddWidget}
        />
      </main>
    </div>
  )
}