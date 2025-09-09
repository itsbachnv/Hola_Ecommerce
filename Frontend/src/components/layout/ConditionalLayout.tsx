'use client'

import { usePathname } from 'next/navigation'
import Headers from "@/components/homepage/Header"
import Footer from '@/components/homepage/Footer'
import AuthProvider from '@/components/providers/AuthProvider'
import { Toaster } from 'react-hot-toast'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()
  
  // Routes that should not have header/footer
  const noLayoutRoutes = ['/dashboard']
  const shouldHideLayout = noLayoutRoutes.some(route => pathname.startsWith(route))

  if (shouldHideLayout) {
    return (
      <AuthProvider>
        <Toaster position="top-right" />
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </AuthProvider>
    )
  }

  return (
    <AuthProvider>
      <main className="min-h-screen">
        <Headers />
        <Toaster position="top-right" />
        {children}
        <Footer />
      </main>
    </AuthProvider>
  )
}
