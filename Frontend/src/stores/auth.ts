import { useEffect } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  initializeAuth: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isInitialized: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
          const response = await fetch(`${apiUrl}/users/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          })
          
          if (!response.ok) {
            throw new Error('Login failed')
          }
          
          const data = await response.json()
          set({ user: data.user, token: data.token, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true })
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
          const response = await fetch(`${apiUrl}/users/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
          })
          
          if (!response.ok) {
            throw new Error('Registration failed')
          }
          
          const data = await response.json()
          set({ user: data.user, token: data.token, isLoading: false })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      logout: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        set({ user: null, token: null })
      },
      
      setUser: (user) => {
        set({ user })
      },
      
      setToken: (token) => {
        set({ token })
      },

      initializeAuth: () => {
        // Load user and token from localStorage on app start
        const token = localStorage.getItem('token')
        const userStr = localStorage.getItem('user')
        
        if (token && userStr) {
          try {
            const user = JSON.parse(userStr)
            set({ user, token, isInitialized: true })
          } catch {
            // Invalid user data, clear localStorage
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            set({ isInitialized: true })
          }
        } else {
          set({ isInitialized: true })
        }
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)

// Helper hook to check if user has specific role
export const useAuth = () => {
  const { user, token, isInitialized, initializeAuth, ...rest } = useAuthStore()
  
  // Initialize auth when hook is first used
  useEffect(() => {
    if (!isInitialized) {
      initializeAuth()
    }
  }, [isInitialized, initializeAuth])
  
  const isAuthenticated = !!user && !!token
  const isAdmin = user?.role === 'Admin'
  const isStaff = user?.role === 'Staff' || isAdmin
  const isCustomer = user?.role === 'Customer'
  
  return {
    user,
    token,
    isInitialized,
    isAuthenticated,
    isAdmin,
    isStaff,
    isCustomer,
    initializeAuth,
    ...rest
  }
}
