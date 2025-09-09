'use client'

import { useEffect, useState } from 'react'
import { useAuthStore } from '@/stores/auth'

interface AuthProviderProps {
  children: React.ReactNode
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false)
  const initializeAuth = useAuthStore(state => state.initializeAuth)

  useEffect(() => {
    // Ensure we're on client side and initialize auth
    setIsHydrated(true)
    initializeAuth()
  }, [initializeAuth])

  // Prevent SSR mismatch by only rendering children after hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang khởi tạo...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
