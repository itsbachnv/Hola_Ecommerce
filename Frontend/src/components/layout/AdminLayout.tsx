'use client'
import Image from 'next/image'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/stores/auth'
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
import { NotificationButton } from '../notification/NotificationButton'
import { useGuestConversations } from '@/hooks/chat/useGuestConversations';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageCircle } from 'lucide-react';
import { GuestConversationList } from '../chat/GuestConversationList'


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

  // Guest conversations for admin/staff
  const {
    conversations: guestConversations,
    loading: guestLoading,
    totalCount: guestTotalCount,
    refreshGuests
  } = useGuestConversations();
  const [selectedGuest, setSelectedGuest] = useState<null | typeof guestConversations[0]>(null);

  // State để mở modal chat guest
  const [openGuestChat, setOpenGuestChat] = useState(false);

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
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
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
              <NotificationButton/>
              
              {user?.avatar ? (
                <Image
                  src={user.avatar}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
          {/* Nút mở chat khách tư vấn cho admin/staff */}
          {user?.role && (user.role === 'Admin' || user.role === 'Staff') && (
            <>
              {/* Nút nổi ở góc phải dưới */}
              {!openGuestChat && (
                <button
                  className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:scale-105 transition-all flex items-center gap-2"
                  onClick={() => setOpenGuestChat(true)}
                  title="Tin nhắn khách tư vấn"
                >
                  <MessageCircle className="w-6 h-6" />
                  <span className="hidden md:inline">Tin nhắn khách tư vấn</span>
                  {guestTotalCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-0.5 animate-pulse">
                      {guestTotalCount > 99 ? '99+' : guestTotalCount}
                    </span>
                  )}
                </button>
              )}

              {/* Modal chat guest */}
              {openGuestChat && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
                  <div className="relative w-full max-w-3xl h-[80vh] bg-white rounded-2xl shadow-2xl flex flex-col">
                    {/* Đóng modal */}
                    <button
                      className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
                      onClick={() => setOpenGuestChat(false)}
                      title="Đóng chat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                    <div className="flex-1 overflow-hidden flex flex-row">
                      {/* Danh sách guest bên trái */}
                      <div className="w-1/3 min-w-[260px] max-w-xs border-r border-gray-200 bg-gray-50 h-full overflow-y-auto">
                        <GuestConversationList
                          conversations={guestConversations}
                          selectedConversation={selectedGuest}
                          onSelectConversation={setSelectedGuest}
                          loading={guestLoading}
                          totalCount={guestTotalCount}
                          onRefresh={refreshGuests}
                        />
                      </div>
                      {/* Box chat với guest bên phải */}
                      <div className="flex-1 h-full">
                        {selectedGuest ? (
                          <ChatWindow
                            conversation={{
                              userId: selectedGuest.guestId,
                              fullName: selectedGuest.name,
                              avatarUrl: '',
                              role: 'Guest',
                              phone: selectedGuest.phoneNumber || '',
                              unreadCount: selectedGuest.unreadCount || 0,
                            }}
                            onBack={() => setSelectedGuest(null)}
                          />
                        ) : (
                          <div className="h-full flex items-center justify-center text-gray-400">
                            Chọn khách tư vấn để bắt đầu chat
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
