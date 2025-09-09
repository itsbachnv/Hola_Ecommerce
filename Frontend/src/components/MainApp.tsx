'use client'

import { useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import Dashboard from '@/components/admin/Dashboard'
import ProductManagement from '@/components/admin/ProductManagement'
import OrderManagement from '@/components/admin/OrderManagement'
import ProductCatalog from '@/components/catalog/ProductCatalog'
import ProductDetail from '@/components/product/ProductDetail'
import ShoppingCart, { MiniCart } from '@/components/cart/ShoppingCart'
import Checkout from '@/components/checkout/Checkout'
import OrderTracking from '@/components/orders/OrderTracking'
import { useAuth } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'

// Mock data - in real app, this would come from APIs
const mockDashboardStats = {
  totalRevenue: 5420000,
  totalOrders: 156,
  averageOrderValue: 347500,
  ordersByStatus: {
    Pending: 12,
    Paid: 45,
    Shipped: 67,
    Delivered: 32
  },
  topProducts: [],
  revenueChart: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
    revenue: Math.floor(Math.random() * 500000) + 100000,
    orders: Math.floor(Math.random() * 20) + 5
  }))
}

const mockCategories = [
  { id: '1', name: 'Electronics', description: 'Electronic devices and accessories', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '2', name: 'Clothing', description: 'Fashion and apparel', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: '3', name: 'Home & Garden', description: 'Home improvement and garden supplies', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
]

const mockProducts = [
  {
    id: '1',
    name: 'iPhone 15 Pro',
    description: 'Latest iPhone with advanced features and powerful performance.',
    shortDescription: 'Latest iPhone model',
    categoryId: '1',
    category: mockCategories[0],
    brand: 'Apple',
    images: ['/products/iphone-15-pro.jpg'],
    variants: [
      {
        id: 'v1',
        sku: 'IPH15P-128-BLU',
        productId: '1',
        name: '128GB Blue',
        price: 25000000,
        originalPrice: 27000000,
        stock: 50,
        attributes: { color: 'Blue', storage: '128GB' },
        images: ['/products/iphone-15-pro-blue.jpg'],
        isActive: true
      }
    ],
    tags: ['smartphone', 'apple', 'premium'],
    isActive: true,
    isFeatured: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

const mockOrders = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    userId: '1',
    user: { id: '1', email: 'customer@example.com', name: 'John Doe', role: 'Customer' as const, isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    status: 'Paid' as const,
    paymentStatus: 'Paid' as const,
    items: [
      {
        id: '1',
        orderId: '1',
        productId: '1',
        variantId: 'v1',
        product: mockProducts[0],
        variant: mockProducts[0].variants[0],
        quantity: 1,
        price: 25000000,
        total: 25000000
      }
    ],
    subtotal: 25000000,
    shipping: 0,
    tax: 2500000,
    discount: 0,
    total: 27500000,
    shippingAddress: {
      fullName: 'John Doe',
      phone: '0901234567',
      address: '123 Main Street',
      city: 'Ho Chi Minh City',
      district: 'District 1',
      ward: 'Ben Nghe Ward'
    },
    paymentMethod: 'MoMo' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export default function MainApp() {
  const { isAuthenticated, isAdmin, isStaff, isCustomer } = useAuth()
  const { getItemCount, getTotal } = useCartStore()
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  // If not authenticated, show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">Welcome to Our Store</h2>
          <p className="text-gray-600 text-center mb-6">Please log in to continue</p>
          <div className="space-y-4">
            <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700">
              Login
            </button>
            <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50">
              Register
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        if (isAdmin || isStaff) {
          return <Dashboard stats={mockDashboardStats} />
        }
        // Customer dashboard or redirect to shop
        return <ProductCatalog 
          products={mockProducts}
          categories={mockCategories}
          onProductClick={(product) => setSelectedProduct(product)}
          onAddToCart={(product, variantId) => {
            // Add to cart logic handled by store
            console.log('Add to cart:', product.name, variantId)
          }}
        />

      case 'products':
        if (isAdmin || isStaff) {
          return <ProductManagement
            products={mockProducts}
            categories={mockCategories}
            onCreateProduct={(product) => console.log('Create product:', product)}
            onUpdateProduct={(id, product) => console.log('Update product:', id, product)}
            onDeleteProduct={(id) => console.log('Delete product:', id)}
            onToggleStatus={(id, isActive) => console.log('Toggle status:', id, isActive)}
          />
        }
        break

      case 'orders':
        if (isAdmin || isStaff) {
          return <OrderManagement
            orders={mockOrders}
            onUpdateOrderStatus={(orderId, status) => console.log('Update order status:', orderId, status)}
            onUpdateTracking={(orderId, tracking) => console.log('Update tracking:', orderId, tracking)}
            onCancelOrder={(orderId) => console.log('Cancel order:', orderId)}
          />
        }
        break

      case 'my-orders':
        if (isCustomer) {
          return <OrderTracking
            orders={mockOrders.filter(order => order.userId === 'current-user-id')}
            onSearchOrder={(orderNumber) => console.log('Search order:', orderNumber)}
          />
        }
        break

      case 'checkout':
        return <Checkout
          onOrderSubmit={(orderData) => console.log('Submit order:', orderData)}
        />

      default:
        return <div>Page not found</div>
    }
  }

  if (selectedProduct) {
    return (
      <AdminLayout>
        <ProductDetail
          product={selectedProduct}
          onAddToCart={(variant, quantity) => {
            console.log('Add to cart:', variant.name, quantity)
            // Add to cart logic
          }}
          onClose={() => setSelectedProduct(null)}
          relatedProducts={mockProducts.filter(p => p.id !== selectedProduct.id)}
        />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      {/* Header with cart for customers */}
      {isCustomer && (
        <div className="fixed top-4 right-4 z-40">
          <MiniCart
            itemCount={getItemCount()}
            total={getTotal()}
            onClick={() => setIsCartOpen(true)}
          />
        </div>
      )}

      {/* Main content */}
      {renderContent()}

      {/* Shopping cart sidebar */}
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false)
          setCurrentPage('checkout')
        }}
      />
    </AdminLayout>
  )
}

// Navigation helper for switching pages
export function useNavigation() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  
  const navigateTo = (page: string) => {
    setCurrentPage(page)
  }

  return { currentPage, navigateTo }
}
