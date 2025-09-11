// Types for the ecommerce system

export interface User {
  id: number // Changed from string to number
  email?: string // Made optional
  phone?: string // Added phone field
  fullName?: string // Changed from name to fullName
  role?: string // Changed from specific union to string
  isActive: boolean
  meta?: Record<string, unknown> // Added meta field
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  slug: string // Added slug field
  parentId?: number | null
  path?: string // Added path field
  createdAt?: string // Made optional to match C# nullable
  updatedAt?: string // Made optional to match C# nullable
  parent?: Category // Added parent reference
}

// Add Brand interface
export interface Brand {
  id: number
  name: string
  slug: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface ProductImage {
  id: number
  productId: number
  url: string
  isPrimary: boolean
  sortOrder: number
  createdAt: string
}

export interface ProductVariant {
  id: number
  sku: string
  productId: number
  name?: string // Made optional
  price: number
  compareAtPrice?: number // Changed from originalPrice to compareAtPrice
  stockQty: number // Changed from stock to stockQty
  weightGrams?: number // Added weightGrams
  attributes?: Record<string, unknown> // Changed from Record<string, string> to unknown
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: number
  brandId?: number // Made optional
  categoryId?: number // Made optional 
  name: string
  slug: string
  description?: string
  attributes?: Record<string, unknown> | null
  status: string // Changed from union to string
  createdAt: string
  updatedAt: string
  
  // Navigation properties
  brand?: Brand
  category?: Category
  variants: ProductVariant[]
  images: ProductImage[]
  
  // Computed properties (might be added by API)
  categoryName?: string
  brandName?: string
  primaryImageUrl?: string | null
  maxPrice?: number | null
  compareAtPrice?: number | null
  minPrice?: number | null
  tags?: string[]
  isFeatured?: boolean
}

export interface CartItem {
  id: number // Changed from string to number
  cartId: number // Added cartId
  productId: number // Changed from string to number
  variantId?: number // Changed from string to number and made optional
  quantity: number
  unitPrice: number // Added unitPrice
  totalPrice: number // Added totalPrice
  createdAt: string
  
  // Navigation properties
  cart?: Cart
  product?: Product
  variant?: ProductVariant
}

export interface Cart {
  id: number // Changed from string to number
  userId?: number // Changed from string to number
  status: string // Added status field
  createdAt: string
  updatedAt: string
  
  // Navigation properties
  user?: User
  items: CartItem[]
  
  // Computed properties
  total?: number
  itemCount?: number
}

export enum OrderStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Confirmed = 'Confirmed',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Returned = 'Returned'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Failed = 'Failed',
  Refunded = 'Refunded'
}

export enum ShipmentStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  InTransit = 'InTransit',
  Delivered = 'Delivered',
  Failed = 'Failed'
}

export interface Payment {
  id: number
  orderId: number
  provider: string // COD | MoMo | VNPAY
  providerTxnId?: string
  status: PaymentStatus
  amount: number
  payload?: Record<string, unknown>
  createdAt: string
  paidAt?: string
  
  // Navigation properties
  order?: Order
}

export interface Shipment {
  id: number
  orderId: number
  status: ShipmentStatus
  carrier?: string
  trackingNumber?: string
  fee: number
  address?: Record<string, unknown>
  createdAt: string
  shippedAt?: string
  deliveredAt?: string
  
  // Navigation properties
  order?: Order
}

export interface OrderItem {
  id: number // Changed from string to number
  orderId: number // Changed from string to number
  productId: number // Changed from string to number
  variantId?: number // Changed from string to number and made optional
  quantity: number
  unitPrice: number // Changed from price to unitPrice
  totalPrice: number // Changed from total to totalPrice
  
  // Navigation properties
  order?: Order
  product?: Product
  variant?: ProductVariant
}

export interface Order {
  id: number // Changed from string to number
  code: string // Changed from orderNumber to code
  userId?: number // Changed from string to number
  status: OrderStatus
  subtotal: number
  discountTotal: number // Added discountTotal
  shippingFee: number // Changed from shipping to shippingFee
  taxTotal: number // Changed from tax to taxTotal
  grandTotal: number // Changed from total to grandTotal
  voucherCode?: string // Added voucherCode
  shippingAddress?: Record<string, unknown> // Changed structure
  billingAddress?: Record<string, unknown> // Added billingAddress
  notes?: string
  createdAt: string
  paidAt?: string // Added paidAt
  shippedAt?: string
  deliveredAt?: string
  cancelledAt?: string // Added cancelledAt
  
  // Navigation properties
  user?: User
  items: OrderItem[]
  payments: Payment[]
  shipments: Shipment[]
}

export enum VoucherType {
  Percentage = 'Percentage',
  Fixed = 'Fixed'
}

export interface Voucher {
  id: number // Changed from string to number
  code: string
  type: VoucherType // Changed from string to enum
  value: number
  minSubtotal: number // Changed from minOrderValue to minSubtotal
  startAt: string // Changed from startsAt to startAt
  endAt: string // Changed from expiresAt to endAt
  usageLimit?: number
  usedCount: number
  scope?: Record<string, unknown> // Changed structure
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: number // Changed from string to number
  title?: string
  message?: string
  type?: string
  createdAt: string
  
  // Business logic fields
  relatedObjectType?: string
  relatedObjectId?: number
  mappingUrl?: string
  senderId?: number
  
  // Navigation properties
  recipients: NotificationRecipient[]
}

export interface NotificationRecipient {
  notificationId: number
  userId: number
  isRead: boolean
  readAt?: string
  deliveredAt?: string
  
  // Navigation properties
  notification?: Notification
  user?: User
}

export enum ChatRole {
  User = 'User',
  Assistant = 'Assistant',
  System = 'System'
}

export interface ChatMessage {
  id: number // Changed from string to number
  userId?: number // Changed from string to number
  role: ChatRole // Changed from isBot to role enum
  content: string // Changed from message to content
  meta?: Record<string, unknown> // Added meta field
  createdAt: string // Changed from timestamp
  
  // Navigation properties
  user?: User
}

// Add missing enums and interfaces
export enum InventoryTxnType {
  In = 'In',
  Out = 'Out',
  Transfer = 'Transfer',
  Adjustment = 'Adjustment'
}

export interface VoucherRedemption {
  id: number
  voucherId: number
  userId?: number
  orderId: number
  redeemedAt: string
  
  // Navigation properties
  voucher?: Voucher
  user?: User
  order?: Order
}

export interface InventoryLedger {
  id: number
  productId: number
  variantId?: number
  type: InventoryTxnType
  quantity: number
  reference?: string
  createdAt: string
  
  // Navigation properties
  product?: Product
  variant?: ProductVariant
}

export interface StockReservation {
  id: number
  orderId: number
  productId: number
  variantId?: number
  quantity: number
  expiresAt: string
  
  // Navigation properties
  order?: Order
  product?: Product
  variant?: ProductVariant
}

export interface AuditLog {
  id: number
  actor?: string
  action: string
  entity: string
  entityId?: number
  diff?: Record<string, unknown>
  createdAt: string
}

export interface IdempotencyKey {
  id: number
  key: string
  scope?: string
  createdAt: string
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
  categoryId?: number // Changed from string to number
  brandId?: number // Changed from brand string to brandId number
  minPrice?: number
  maxPrice?: number
  search?: string
  tags?: string[]
  status?: string // Changed from isActive boolean to status string
  isFeatured?: boolean
  inStock?: boolean
}

export interface OrderFilters {
  status?: OrderStatus
  startDate?: string
  endDate?: string
  userId?: number // Changed from string to number
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
  shippingAddress: Record<string, unknown> // Changed to match JsonDocument
  billingAddress?: Record<string, unknown> // Added billingAddress
  paymentMethod: string // Changed from union to string
  notes?: string
}

export type VariantForm = {
  id?: number
  sku: string
  name?: string // Made optional
  price: number
  compareAtPrice?: number // Changed from originalPrice
  stockQty: number // Changed from stock
  weightGrams?: number // Added weightGrams
  color?: string // Added color field
  size?: string // Added size field
  attributes?: Record<string, unknown> // Changed to unknown
}

export type ProductForm = {
  name: string
  slug?: string // Added slug
  description?: string // Made optional
  categoryId?: number // Made optional
  brandId?: number // Changed from string to number and made optional
  attributes?: Record<string, unknown> // Added attributes
  isFeatured?: boolean // Made optional
  status?: string // Made optional
  images?: ProductImage[] // Changed from string[] to ProductImage[]
  variants?: VariantForm[] // Made optional
  newImageFiles?: File[] // For new image uploads during edit
  imagesToDelete?: number[] // IDs of existing images to delete
}

export interface VoucherForm {
  code: string
  type: VoucherType // Changed from string to enum
  value: number
  minSubtotal?: number // Changed from minOrderValue
  usageLimit?: number
  startAt: string // Changed from startsAt
  endAt: string // Changed from expiresAt
  scope?: Record<string, unknown> // Changed structure
}
