// Types for the ecommerce system

export interface User {
  id: string
  email: string
  name: string
  role: 'Admin' | 'Staff' | 'Customer'
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: string
  name: string
  description?: string
  image?: string
  parentId?: string
  children?: Category[]
  createdAt: string
  updatedAt: string
}

export interface ProductVariant {
  id: string
  sku: string
  productId: string
  name: string
  price: number
  originalPrice?: number
  stock: number
  attributes: Record<string, string> // e.g., { color: 'red', size: 'L' }
  images: string[]
  isActive: boolean
}

export interface Product {
  id: string
  name: string
  description: string
  shortDescription?: string
  categoryId: string
  category?: Category
  brand?: string
  images: string[]
  variants: ProductVariant[]
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  createdAt: string
  updatedAt: string
}

export interface CartItem {
  id: string
  productId: string
  variantId: string
  product: Product
  variant: ProductVariant
  quantity: number
  addedAt: string
}

export interface Cart {
  id: string
  userId?: string
  items: CartItem[]
  total: number
  itemCount: number
  updatedAt: string
}

export enum OrderStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  AwaitingFulfillment = 'AwaitingFulfillment',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Failed = 'Failed',
  Returned = 'Returned'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Failed = 'Failed',
  Refunded = 'Refunded'
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId: string
  product: Product
  variant: ProductVariant
  quantity: number
  price: number
  total: number
}

export interface Order {
  id: string
  orderNumber: string
  userId?: string
  user?: User
  status: OrderStatus
  paymentStatus: PaymentStatus
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  discount: number
  total: number
  
  // Shipping info
  shippingAddress: {
    fullName: string
    phone: string
    address: string
    city: string
    district: string
    ward: string
    postalCode?: string
  }
  
  // Payment info
  paymentMethod: 'MoMo' | 'VNPAY' | 'Cash'
  paymentId?: string
  
  // Tracking
  trackingNumber?: string
  shippedAt?: string
  deliveredAt?: string
  
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Voucher {
  id: string
  code: string
  name: string
  description?: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderValue?: number
  maxDiscountValue?: number
  usageLimit?: number
  usedCount: number
  startsAt: string
  expiresAt: string
  isActive: boolean
  scope: 'all' | 'categories' | 'products'
  scopeIds: string[]
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  userId?: string
  type: 'order' | 'payment' | 'shipping' | 'system'
  title: string
  message: string
  isRead: boolean
  data?: Record<string, any>
  createdAt: string
}

export interface ChatMessage {
  id: string
  userId?: string
  message: string
  response?: string
  isBot: boolean
  timestamp: string
}

// Dashboard Types
export interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  averageOrderValue: number
  ordersByStatus: Record<OrderStatus, number>
  topProducts: Array<{
    product: Product
    variant: ProductVariant
    soldQuantity: number
    revenue: number
  }>
  revenueChart: Array<{
    date: string
    revenue: number
    orders: number
  }>
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Filter and Search Types
export interface ProductFilters {
  categoryId?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  tags?: string[]
  isActive?: boolean
  isFeatured?: boolean
  inStock?: boolean
}

export interface OrderFilters {
  status?: OrderStatus
  paymentStatus?: PaymentStatus
  startDate?: string
  endDate?: string
  userId?: string
  search?: string
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface CheckoutForm {
  shippingAddress: {
    fullName: string
    phone: string
    address: string
    city: string
    district: string
    ward: string
    postalCode?: string
  }
  paymentMethod: 'MoMo' | 'VNPAY' | 'Cash'
  notes?: string
}

export interface ProductForm {
  name: string
  description: string
  shortDescription?: string
  categoryId: string
  brand?: string
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  variants: Omit<ProductVariant, 'id' | 'productId'>[]
}

export interface VoucherForm {
  code: string
  name: string
  description?: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderValue?: number
  maxDiscountValue?: number
  usageLimit?: number
  startsAt: string
  expiresAt: string
  isActive: boolean
  scope: 'all' | 'categories' | 'products'
  scopeIds: string[]
}
