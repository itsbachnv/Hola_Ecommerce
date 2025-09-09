'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/auth'
import AdminLayout from '@/components/layout/AdminLayout'
import ProductManagement from '@/components/admin/ProductManagement'
import { Product, Category, ProductForm } from '@/types'
import toast from 'react-hot-toast'

// Mock data sản phẩm
const mockProducts: Product[] = []

const mockCategories: Category[] = []

export default function ProductsManagementPage() {
  const { isAuthenticated, isAdmin, isStaff, isInitialized } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>(mockProducts)
  const [categories] = useState<Category[]>(mockCategories)
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

  const handleCreateProduct = async (productData: ProductForm) => {
    setIsLoading(true)
    try {
      // TODO: Gọi API để tạo sản phẩm mới
      const newProduct: Product = {
        id: Math.floor(Math.random() * 1000000),
        name: productData.name,
        description: productData.description,
        shortDescription: productData.shortDescription,
        categoryId: productData.categoryId,
        brandId: productData.brandId ? Number(productData.brandId) : undefined,
        tags: productData.tags,
        images: ['/products/default.jpg'], // Default image
        variants: [],
        status: productData.status as 'ACTIVE' | 'INACTIVE' | 'DRAFT',
        isFeatured: productData.isFeatured,
        slug: productData.slug ?? '', // Add slug property
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setProducts(prev => [...prev, newProduct])
      toast.success('Tạo sản phẩm thành công!')
    } catch {
      toast.error('Có lỗi xảy ra khi tạo sản phẩm')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateProduct = async (id: string, productData: ProductForm) => {
    setIsLoading(true)
    try {
      // TODO: Gọi API để cập nhật sản phẩm
      setProducts(prev => prev.map(product => 
        String(product.id) === id 
          ? { 
              ...product, 
              name: productData.name,
              description: productData.description,
              shortDescription: productData.shortDescription,
              categoryId: productData.categoryId,
              brand: productData.brandId,
              tags: productData.tags,
              isActive: productData.status,
              isFeatured: productData.isFeatured,
              updatedAt: new Date().toISOString() 
            }
          : product
      ))
      toast.success('Cập nhật sản phẩm thành công!')
    } catch {
      toast.error('Có lỗi xảy ra khi cập nhật sản phẩm')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    setIsLoading(true)
    try {
      // TODO: Gọi API để xóa sản phẩm
      setProducts(prev => prev.filter(product => String(product.id) !== id))
      toast.success('Xóa sản phẩm thành công!')
    } catch {
      toast.error('Có lỗi xảy ra khi xóa sản phẩm')
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    setIsLoading(true)
    try {
      // TODO: Gọi API để thay đổi trạng thái sản phẩm
      setProducts(prev => prev.map(product => 
        String(product.id) === id 
          ? { ...product, isActive, updatedAt: new Date().toISOString() }
          : product
      ))
      toast.success(`${isActive ? 'Kích hoạt' : 'Vô hiệu hóa'} sản phẩm thành công!`)
    } catch {
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái sản phẩm')
    } finally {
      setIsLoading(false)
    }
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
              <h1 className="text-3xl font-bold text-gray-900">Quản Lý Sản Phẩm</h1>
              <p className="text-gray-600 mt-1">
                Quản lý danh sách sản phẩm, thêm sửa xóa sản phẩm
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng Sản Phẩm</p>
                  <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đang Hoạt Động</p>
                  <p className="text-3xl font-bold text-green-600">
                    {products.filter(p => p.status === 'ACTIVE').length}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Không Hoạt Động</p>
                  <p className="text-3xl font-bold text-red-600">
                    {products.filter(p => p.status === 'INACTIVE').length}
                  </p>
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
                  <p className="text-sm font-medium text-gray-600">Sản Phẩm Nổi Bật</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {products.filter(p => p.isFeatured).length}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Product Management Component */}
          <ProductManagement
            products={products}
            categories={categories}
            onCreateProduct={handleCreateProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onToggleStatus={handleToggleStatus}
            isLoading={isLoading}
          />
        </div>
      </AdminLayout>
    </div>
  )
}
