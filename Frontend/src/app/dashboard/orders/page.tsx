'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/auth'
import AdminLayout from '@/components/layout/AdminLayout'
import OrderManagement from '@/components/admin/OrderManagement'
import { Order, OrderStatus, PaymentStatus } from '@/types'
import toast from 'react-hot-toast'

// Mock data đơn hàng với đúng type
const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2025-001',
    userId: 'user1',
    user: {
      id: 'user1',
      name: 'Nguyễn Văn An',
      email: 'nguyenvanan@gmail.com',
      role: 'Customer',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    status: OrderStatus.Pending,
    paymentStatus: PaymentStatus.Paid,
    items: [
      {
        id: 'item1',
        orderId: '1',
        productId: '1',
        variantId: 'v1',
        product: {
          id: '1',
          name: 'Nike Air Max 270',
          description: 'Giày thể thao Nike Air Max 270',
          shortDescription: 'Giày thể thao Nike',
          categoryId: '1',
          brand: 'Nike',
          images: ['/products/nike-air-max-270.jpg'],
          variants: [],
          tags: ['nike', 'giày thể thao'],
          isActive: true,
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        variant: {
          id: 'v1',
          sku: 'NIKE-AM270-42-BLK',
          productId: '1',
          name: 'Size 42 - Đen',
          price: 3500000,
          stock: 25,
          attributes: { size: '42', color: 'Đen' },
          images: ['/products/nike-air-max-270-black.jpg'],
          isActive: true
        },
        quantity: 1,
        price: 3500000,
        total: 3500000
      }
    ],
    subtotal: 3500000,
    shipping: 30000,
    tax: 350000,
    discount: 0,
    total: 3880000,
    shippingAddress: {
      fullName: 'Nguyễn Văn An',
      phone: '0901234567',
      address: '123 Nguyễn Huệ, Phường Bến Nghé',
      ward: 'Phường Bến Nghé',
      district: 'Quận 1',
      city: 'TP. Hồ Chí Minh',
      postalCode: '70000'
    },
    paymentMethod: 'VNPAY',
    notes: 'Giao hàng vào buổi chiều',
    trackingNumber: 'VNP123456789',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    orderNumber: 'ORD-2025-002',
    userId: 'user2',
    user: {
      id: 'user2',
      name: 'Trần Thị Bình',
      email: 'tranthibinh@gmail.com',
      role: 'Customer',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    status: OrderStatus.Shipped,
    paymentStatus: PaymentStatus.Paid,
    items: [
      {
        id: 'item2',
        orderId: '2',
        productId: '2',
        variantId: 'v3',
        product: {
          id: '2',
          name: 'Adidas Ultraboost 22',
          description: 'Giày chạy bộ Adidas Ultraboost 22',
          shortDescription: 'Giày chạy bộ Adidas',
          categoryId: '1',
          brand: 'Adidas',
          images: ['/products/adidas-ultraboost-22.jpg'],
          variants: [],
          tags: ['adidas', 'giày chạy bộ'],
          isActive: true,
          isFeatured: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        variant: {
          id: 'v3',
          sku: 'ADS-UB22-41-BLU',
          productId: '2',
          name: 'Size 41 - Xanh dương',
          price: 4200000,
          stock: 15,
          attributes: { size: '41', color: 'Xanh dương' },
          images: ['/products/adidas-ultraboost-22-blue.jpg'],
          isActive: true
        },
        quantity: 1,
        price: 4200000,
        total: 4200000
      }
    ],
    subtotal: 4200000,
    shipping: 30000,
    tax: 420000,
    discount: 200000,
    total: 4450000,
    shippingAddress: {
      fullName: 'Trần Thị Bình',
      phone: '0912345678',
      address: '456 Lê Lợi, Phường Bến Thành',
      ward: 'Phường Bến Thành',
      district: 'Quận 1', 
      city: 'TP. Hồ Chí Minh',
      postalCode: '70000'
    },
    paymentMethod: 'MoMo',
    notes: 'Gói cẩn thận',
    trackingNumber: 'MM987654321',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    orderNumber: 'ORD-2025-003',
    userId: 'user3',
    user: {
      id: 'user3',
      name: 'Lê Văn Cường',
      email: 'levancuong@gmail.com',
      role: 'Customer',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    status: OrderStatus.Delivered,
    paymentStatus: PaymentStatus.Paid,
    items: [
      {
        id: 'item3',
        orderId: '3',
        productId: '3',
        variantId: 'v4',
        product: {
          id: '3',
          name: 'Converse Chuck Taylor All Star',
          description: 'Giày sneaker cổ điển Converse',
          shortDescription: 'Giày sneaker Converse',
          categoryId: '2',
          brand: 'Converse',
          images: ['/products/converse-chuck-taylor.jpg'],
          variants: [],
          tags: ['converse', 'sneaker'],
          isActive: true,
          isFeatured: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        variant: {
          id: 'v4',
          sku: 'CNV-CT-40-RED',
          productId: '3',
          name: 'Size 40 - Đỏ',
          price: 1800000,
          stock: 40,
          attributes: { size: '40', color: 'Đỏ' },
          images: ['/products/converse-chuck-taylor-red.jpg'],
          isActive: true
        },
        quantity: 2,
        price: 1800000,
        total: 3600000
      }
    ],
    subtotal: 3600000,
    shipping: 30000,
    tax: 360000,
    discount: 0,
    total: 3990000,
    shippingAddress: {
      fullName: 'Lê Văn Cường',
      phone: '0923456789',
      address: '789 Pasteur, Phường Võ Thị Sáu',
      ward: 'Phường Võ Thị Sáu',
      district: 'Quận 3',
      city: 'TP. Hồ Chí Minh',
      postalCode: '70000'
    },
    paymentMethod: 'Cash',
    notes: '',
    trackingNumber: 'CSH555666777',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export default function OrdersManagementPage() {
  const { isAuthenticated, isAdmin, isStaff, isInitialized } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>(mockOrders)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Chỉ kiểm tra auth khi đã khởi tạo xong
    if (!isInitialized) return

    // Kiểm tra quyền truy cập
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    if (!isAdmin && !isStaff) {
      router.push('/products')
      return
    }
  }, [isInitialized, isAuthenticated, isAdmin, isStaff, router])

  const handleUpdateOrderStatus = async (orderId: string, status: OrderStatus) => {
    setIsLoading(true)
    try {
      // TODO: Gọi API để cập nhật trạng thái đơn hàng
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      ))
      toast.success('Cập nhật trạng thái đơn hàng thành công!')
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateTracking = async (orderId: string, trackingNumber: string) => {
    setIsLoading(true)
    try {
      // TODO: Gọi API để cập nhật mã vận đơn
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, trackingNumber, updatedAt: new Date().toISOString() }
          : order
      ))
      toast.success('Cập nhật mã vận đơn thành công!')
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật mã vận đơn')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    setIsLoading(true)
    try {
      // TODO: Gọi API để hủy đơn hàng
      setOrders(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: OrderStatus.Cancelled, updatedAt: new Date().toISOString() }
          : order
      ))
      toast.success('Hủy đơn hàng thành công!')
    } catch {
      toast.error('Có lỗi xảy ra khi hủy đơn hàng')
    } finally {
      setIsLoading(false)
    }
  }

  // Tính toán thống kê
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === OrderStatus.Pending).length,
    shippedOrders: orders.filter(o => o.status === OrderStatus.Shipped).length,
    deliveredOrders: orders.filter(o => o.status === OrderStatus.Delivered).length,
    cancelledOrders: orders.filter(o => o.status === OrderStatus.Cancelled).length,
    totalRevenue: orders
      .filter(o => o.paymentStatus === PaymentStatus.Paid && o.status !== OrderStatus.Cancelled)
      .reduce((sum, order) => sum + order.total, 0)
  }

  // Loading state khi kiểm tra quyền
  if (!isInitialized || !isAuthenticated || (!isAdmin && !isStaff)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <AdminLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
              <p className="text-gray-600 mt-1">
                Quản lý đơn hàng, cập nhật trạng thái và theo dõi vận chuyển
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng Đơn Hàng</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Chờ Xử Lý</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</p>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang Giao</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.shippedOrders}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã Giao</p>
                  <p className="text-3xl font-bold text-green-600">{stats.deliveredOrders}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã Hủy</p>
                  <p className="text-3xl font-bold text-red-600">{stats.cancelledOrders}</p>
                </div>
                <div className="bg-red-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Doanh Thu</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {new Intl.NumberFormat('vi-VN', { 
                      style: 'currency', 
                      currency: 'VND' 
                    }).format(stats.totalRevenue)}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Order Management Component */}
          <OrderManagement
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onUpdateTracking={handleUpdateTracking}
            onCancelOrder={handleCancelOrder}
            isLoading={isLoading}
          />
        </div>
      </AdminLayout>
    </div>
  )
}
