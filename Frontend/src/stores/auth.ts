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
  loginWithGoogle: () => Promise<void>
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
            // Try to read structured error from API (it may return { detail: '...' } or { message: '...' })
            const errBody = await response.text().catch(() => '')
            let errMsg = 'Login failed'
            if (errBody) {
              try {
                const parsed = JSON.parse(errBody)
                errMsg = parsed.detail || parsed.message || parsed.error || JSON.stringify(parsed)
              } catch {
                // not JSON, use raw text
                errMsg = errBody
              }
            }
            throw new Error(errMsg)
          }

          const data = await response.json()
          
          // Create user object from API response
          const user = {
            id: data.userId || data.Id, // Use UserId from API response
            email: email,
            fullName: data.fullName || data.FullName || email.split('@')[0],
            role: data.role || data.Role || 'Customer',
            phone: '',
            isActive: true,
            meta: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          
          set({ user: user, token: data.token, isLoading: false })
          
          // Store in localStorage for persistence
          localStorage.setItem('token', data.token)
          localStorage.setItem('user', JSON.stringify(user))
          
          // Clear guest session id
          localStorage.removeItem('guestId')

          // Load/sync user's cart after successful login.
          // To avoid duplicates we first check if there was a pre-login guest cart in localStorage.
          try {
            const { useCartStore } = await import('./cart')
            const { loadCartFromServer, syncToServer } = useCartStore.getState()

            // Detect persisted guest cart under same persist key used by cart store
            const persisted = localStorage.getItem('cart-storage')
            let guestCartHasItems = false
            if (persisted) {
              try {
                const parsed = JSON.parse(persisted)
                // Zustand persist may store state directly or under `state` key
                const persistedCart = parsed?.state?.cart ?? parsed?.cart ?? null
                guestCartHasItems = !!(persistedCart && persistedCart.items && persistedCart.items.length > 0)
              } catch {
                guestCartHasItems = false
              }
            }

            if (guestCartHasItems) {
              // Sync guest cart to server first (merge into user's server cart), then reload server cart into local
              await syncToServer(data.token, user.id)
              await loadCartFromServer(data.token, user.id)
            } else {
              // No guest cart -> just load server cart
              await loadCartFromServer(data.token, user.id)
            }
          } catch {
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true })
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
          const response = await fetch(`${apiUrl}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              email, 
              password, 
              fullName: name // Map name to fullName as expected by API
            })
          })
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Registration failed' }))
            throw new Error(errorData.message || 'Registration failed')
          }
          
          const data = await response.json()
          
          // Create user object from registration response 
          const user = {
            id: data.id || Date.now(),
            email: data.email || email,
            fullName: data.fullName || name,
            role: data.role || 'Customer',
            phone: data.phone || '',
            isActive: data.isActive ?? true,
            meta: data.meta || {},
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: data.updatedAt || new Date().toISOString()
          }
          
          // Registration doesn't return token, only user data
          set({ user: user, token: null, isLoading: false })
          
          // Note: Registration doesn't auto-login, user needs to login separately
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      loginWithGoogle: async () => {
        set({ isLoading: true })
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
          window.location.href = `${apiUrl}/api/auth/login-google`;
          set({ isLoading: false })
        } catch (error) {}
    },
      
      logout: () => {
        // Clear all user-related data
        set({ isLoading: false })
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('guestId')
        localStorage.removeItem('auth-storage')
        localStorage.removeItem('notification-cache') // Clear notification cache on logout
        // Clear auth state
        set({ user: null, token: null })
        
        // Clear cart data when logging out
        try {
          import('./cart').then(({ useCartStore }) => {
            const { clearCart } = useCartStore.getState()
            clearCart()
          })
        } catch {
        }
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
