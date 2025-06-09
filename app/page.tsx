'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { DashboardGrid } from '@/components/DashboardGrid'
import { AddWidgetModal } from '@/components/widgets/AddWidgetModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

interface Widget {
  id: string
  widgetType: string
  title: string
  config: any
  deviceToken?: string
  dataField?: string
  refreshInterval?: number
  positionX: number
  positionY: number
  width: number
  height: number
}

interface Dashboard {
  id: string
  name: string
  widgets: Widget[]
  layoutConfig: any
}

export default function Home() {
  const { user, isLoading: authLoading, login, register, logout, getAuthHeaders } = useAuth()
  const router = useRouter()
  
  // Auth form state
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [authSubmitting, setAuthSubmitting] = useState(false)
  
  // Dashboard state
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load dashboards when user is authenticated
  useEffect(() => {
    if (user) {
      loadDashboards()
    }
  }, [user])

  const loadDashboards = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/dashboards', {
        headers: getAuthHeaders()
      })
      
      if (response.ok) {
        const { dashboards } = await response.json()
        setDashboards(dashboards)
        
        // Set the first dashboard as current, or create one if none exist
        if (dashboards.length > 0) {
          setCurrentDashboard(dashboards[0])
        } else {
          await createDefaultDashboard()
        }
      } else {
        toast.error('Failed to load dashboards')
      }
    } catch (error) {
      console.error('Failed to load dashboards:', error)
      toast.error('Failed to load dashboards')
    } finally {
      setLoading(false)
    }
  }

  const createDefaultDashboard = async () => {
    try {
      const response = await fetch('/api/dashboards', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name: 'My Dashboard' }),
      })
      
      if (response.ok) {
        const { dashboard } = await response.json()
        setDashboards([dashboard])
        setCurrentDashboard(dashboard)
      }
    } catch (error) {
      console.error('Failed to create default dashboard:', error)
    }
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthSubmitting(true)

    try {
      let success = false
      if (isLoginMode) {
        success = await login(email, password)
      } else {
        success = await register(email, password, username)
      }

      if (success) {
        setEmail('')
        setPassword('')
        setUsername('')
      }
    } finally {
      setAuthSubmitting(false)
    }
  }

  const handleAddWidget = async (type: string, config: any) => {
    if (!currentDashboard) return

    setLoading(true)
    try {
      const response = await fetch('/api/widgets', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          dashboardId: currentDashboard.id,
          type,
          title: config.title,
          config,
          deviceToken: config.deviceToken,
          dataField: config.dataField,
          refreshInterval: config.refreshInterval,
          x: 0,
          y: 0,
          w: 4,
          h: 3,
        }),
      })
      
      if (response.ok) {
        const { widget } = await response.json()
        const updatedDashboard = {
          ...currentDashboard,
          widgets: [...currentDashboard.widgets, widget]
        }
        setCurrentDashboard(updatedDashboard)
        toast.success('Widget added successfully')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add widget')
      }
    } catch (error) {
      console.error('Failed to add widget:', error)
      toast.error('Failed to add widget')
    }
    setLoading(false)
  }

  const handleWidgetRemove = async (widgetId: string) => {
    if (!currentDashboard) return

    try {
      const response = await fetch(`/api/widgets/${widgetId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      
      if (response.ok) {
        const updatedDashboard = {
          ...currentDashboard,
          widgets: currentDashboard.widgets.filter(w => w.id !== widgetId)
        }
        setCurrentDashboard(updatedDashboard)
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
    if (!currentDashboard) return

    try {
      const response = await fetch(`/api/widgets/${widgetId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ config }),
      })
      
      if (response.ok) {
        const { widget } = await response.json()
        const updatedDashboard = {
          ...currentDashboard,
          widgets: currentDashboard.widgets.map(w => w.id === widgetId ? widget : w)
        }
        setCurrentDashboard(updatedDashboard)
        toast.success('Widget updated')
      } else {
        toast.error('Failed to update widget')
      }
    } catch (error) {
      console.error('Failed to update widget:', error)
      toast.error('Failed to update widget')
    }
  }

  const handleLayoutChange = async (layouts: any) => {
    if (!currentDashboard) return

    try {
      await fetch('/api/widgets/layout', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ 
          dashboardId: currentDashboard.id, 
          layouts 
        }),
      })
    } catch (error) {
      console.error('Failed to save layout:', error)
    }
  }

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Show login/register form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>{isLoginMode ? 'Welcome Back' : 'Create Account'}</CardTitle>
            <CardDescription>
              {isLoginMode 
                ? 'Sign in to access your personalized dashboard'
                : 'Sign up to start building your dashboard'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {!isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username (optional)</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Your username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={authSubmitting}
                >
                  {authSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoginMode ? 'Sign In' : 'Sign Up'}
                </Button>
              </div>
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                >
                  {isLoginMode 
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"
                  }
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show main dashboard
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">IoT Dashboard Platform</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.email}
            </span>
            <Button variant="outline" onClick={() => router.push('/devices')}>
              Manage Devices
            </Button>
            <Button variant="outline" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {currentDashboard?.name || 'My Dashboard'}
          </h2>
          <p className="text-muted-foreground">
            Drag and drop widgets to customize your dashboard
          </p>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : currentDashboard ? (
          <DashboardGrid
            widgets={currentDashboard.widgets.map(w => ({
              id: w.id,
              type: w.widgetType,
              title: w.title,
              config: w.config,
              deviceToken: w.deviceToken,
              dataField: w.dataField,
              refreshInterval: w.refreshInterval,
              x: w.positionX,
              y: w.positionY,
              w: w.width,
              h: w.height,
            }))}
            dashboardId={currentDashboard.id}
            onLayoutChange={handleLayoutChange}
            onWidgetRemove={handleWidgetRemove}
            onWidgetUpdate={handleWidgetUpdate}
            onAddWidget={() => setShowAddModal(true)}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No dashboard found</p>
            <Button onClick={createDefaultDashboard}>
              Create Dashboard
            </Button>
          </div>
        )}
        
        <AddWidgetModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddWidget}
        />
      </main>
    </div>
  )
}