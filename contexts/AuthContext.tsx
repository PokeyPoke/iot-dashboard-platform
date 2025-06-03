'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'

interface User {
  id: string
  email: string
  username?: string
  subscriptionTier: 'FREE' | 'PREMIUM'
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, password: string, username?: string) => Promise<boolean>
  logout: () => void
  getAuthHeaders: () => { [key: string]: string }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [accessToken, setAccessToken] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing session on mount
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      try {
        setAccessToken(token)
        setUser(JSON.parse(userData))
      } catch (error) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Login failed')
        return false
      }

      const data = await response.json()
      
      // Store tokens and user data
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setAccessToken(data.accessToken)
      setUser(data.user)
      
      toast.success('Login successful!')
      return true
    } catch (error) {
      console.error('Login error:', error)
      toast.error('Login failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, username?: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username }),
      })

      if (!response.ok) {
        const error = await response.json()
        toast.error(error.error || 'Registration failed')
        return false
      }

      const data = await response.json()
      
      // Store tokens and user data
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      
      setAccessToken(data.accessToken)
      setUser(data.user)
      
      toast.success('Registration successful!')
      return true
    } catch (error) {
      console.error('Registration error:', error)
      toast.error('Registration failed')
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    setAccessToken(null)
    setUser(null)
    toast.success('Logged out successfully')
  }

  const getAuthHeaders = () => {
    if (!accessToken) return {}
    return {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      login,
      register,
      logout,
      getAuthHeaders
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}