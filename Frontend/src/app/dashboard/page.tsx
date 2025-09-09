'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/auth'
import AdminLayout from '@/components/layout/AdminLayout'
import Dashboard from '@/components/admin/Dashboard'

// Mock dashboard stats
const mockDashboardStats = {
  totalRevenue: 5420000,
  totalOrders: 156,
  averageOrderValue: 347500,
  ordersByStatus: {
    Pending: 12,
    Paid: 45,
    AwaitingFulfillment: 8,
    Shipped: 67,
    Delivered: 32,
    Cancelled: 5,
    Failed: 2,
    Returned: 1
  },
  topProducts: [
    {
      product: {
        id: '1',
        name: 'iPhone 15 Pro',
        description: 'Latest iPhone with advanced features',
        shortDescription: 'Latest iPhone model',
        categoryId: '1',
        brand: 'Apple',
        images: ['/products/iphone-15-pro.jpg'],
        variants: [],
        tags: ['smartphone'],
        isActive: true,
        isFeatured: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      variant: {
        id: 'v1',
        sku: 'IPH15P-128-BLU',
        productId: '1',
        name: '128GB Blue',
        price: 25000000,
        stock: 50,
        attributes: { color: 'Blue', storage: '128GB' },
        images: ['/products/iphone-15-pro-blue.jpg'],
        isActive: true
      },
      soldQuantity: 45,
      revenue: 1125000000
    }
  ],
  revenueChart: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
    revenue: Math.floor(Math.random() * 500000) + 100000,
    orders: Math.floor(Math.random() * 20) + 5
  }))
}

export default function DashboardPage() {
  const { isAuthenticated, isAdmin, isStaff, user, isInitialized } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Chỉ kiểm tra auth khi đã khởi tạo xong
    if (!isInitialized) return

    // Check authentication and role
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Only allow Admin and Staff to access dashboard
    if (!isAdmin && !isStaff) {
      router.push('/products') // Redirect customers to shop
      return
    }
  }, [isInitialized, isAuthenticated, isAdmin, isStaff, router])

  // Show loading while checking auth
  if (!isInitialized || !isAuthenticated || (!isAdmin && !isStaff)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AdminLayout>
        <Dashboard stats={mockDashboardStats} />
      </AdminLayout>
    </div>
  )
}
