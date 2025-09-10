'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/auth'
import AdminLayout from '@/components/layout/AdminLayout'
import ProductManagement from '@/components/admin/ProductManagement'

export default function ProductsManagementPage() {
  const { isAuthenticated, isAdmin, isStaff, isInitialized } = useAuth()
  const router = useRouter()

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
              <h1 className="text-3xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
              <p className="text-gray-600 mt-1">
                Quản lý danh sách sản phẩm, thêm sửa xóa sản phẩm
              </p>
            </div>
          </div>

          {/* Product Management Component - No props needed, it manages itself */}
          <ProductManagement />
        </div>
      </AdminLayout>
    </div>
  )
}
