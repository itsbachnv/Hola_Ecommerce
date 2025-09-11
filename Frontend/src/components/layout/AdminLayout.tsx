'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth'
import NotificationBell from '@/components/ui/NotificationBell'
import { 
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Search,
  User
} from 'lucide-react'


interface SidebarItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  roles?: ('Admin' | 'Staff' | 'Customer')[]
}

const sidebarItems: SidebarItem[] = [
  {
    href: '/dashboard',
    label: 'Tổng Quan',
    icon: Home,
    roles: ['Admin', 'Staff']
  },
  {
    href: '/dashboard/products',
    label: 'Quản Lý Sản Phẩm',
    icon: Package,
    roles: ['Admin', 'Staff']
  },
  {
    href: '/dashboard/orders',
    label: 'Quản Lý Đơn Hàng',
    icon: ShoppingCart,
    roles: ['Admin', 'Staff']
  },
  {
    href: '/dashboard/customers',
    label: 'Khách Hàng',
    icon: Users,
    roles: ['Admin']
  },
  {
    href: '/dashboard/analytics',
    label: 'Thống Kê',
    icon: BarChart3,
    roles: ['Admin']
  },
  {
    href: '/dashboard/settings',
    label: 'Cài Đặt',
    icon: Settings,
    roles: ['Admin', 'Staff']
  },
  // Customer routes
  {
    href: '/',
    label: 'Shop',
    icon: Home,
    roles: ['Customer']
  },
  {
    href: '/my-orders',
    label: 'My Orders',
    icon: ShoppingCart,
    roles: ['Customer']
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
    roles: ['Customer']
  }
]

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout, isCustomer } = useAuth()

  const filteredSidebarItems = sidebarItems.filter(item => {
    if (!item.roles) return true
    const role = (user?.role || 'Customer') as 'Admin' | 'Staff' | 'Customer'
    return item.roles.includes(role)
  })

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">
            {isCustomer ? 'Shop' : 'Admin Panel'}
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="mt-8">
          <div className="px-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
          </div>

          <div className="space-y-1 px-3">
            {filteredSidebarItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="absolute bottom-6 left-3 right-3">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div className="flex-1 max-w-lg mx-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <NotificationBell variant="admin" />
              
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
