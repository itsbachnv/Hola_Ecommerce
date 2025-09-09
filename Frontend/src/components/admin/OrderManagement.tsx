'use client'

import { useState } from 'react'
import { Order, OrderStatus, OrderFilters } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import Button from '@/components/ui/Button'
import { 
  Search, 
  Filter, 
  Eye, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  MoreHorizontal,
  MapPin,
  Phone,
  User,
  CreditCard
} from 'lucide-react'

interface OrderManagementProps {
  orders: Order[]
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void
  onUpdateTracking: (orderId: string, trackingNumber: string) => void
  onCancelOrder: (orderId: string) => void
  isLoading?: boolean
}

export default function OrderManagement({
  orders,
  onUpdateOrderStatus,
  onUpdateTracking,
  onCancelOrder,
  isLoading = false
}: OrderManagementProps) {
  const [filters, setFilters] = useState<OrderFilters>({})
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderDetail, setShowOrderDetail] = useState(false)

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery === '' || 
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !filters.status || order.status === filters.status
    const matchesPaymentStatus = !filters.paymentStatus || order.paymentStatus === filters.paymentStatus
    
    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === OrderStatus.Pending).length,
    paid: orders.filter(o => o.status === OrderStatus.Paid).length,
    shipped: orders.filter(o => o.status === OrderStatus.Shipped).length,
    delivered: orders.filter(o => o.status === OrderStatus.Delivered).length
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return <Clock className="w-5 h-5 text-yellow-500" />
      case OrderStatus.Paid:
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case OrderStatus.AwaitingFulfillment:
        return <Package className="w-5 h-5 text-blue-500" />
      case OrderStatus.Shipped:
        return <Truck className="w-5 h-5 text-purple-500" />
      case OrderStatus.Delivered:
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case OrderStatus.Cancelled:
      case OrderStatus.Failed:
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return 'bg-yellow-100 text-yellow-800'
      case OrderStatus.Paid:
        return 'bg-green-100 text-green-800'
      case OrderStatus.AwaitingFulfillment:
        return 'bg-blue-100 text-blue-800'
      case OrderStatus.Shipped:
        return 'bg-purple-100 text-purple-800'
      case OrderStatus.Delivered:
        return 'bg-green-100 text-green-800'
      case OrderStatus.Cancelled:
      case OrderStatus.Failed:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-4">
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as OrderStatus || undefined })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Status</option>
                {Object.values(OrderStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                value={filters.paymentStatus || ''}
                onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value as any || undefined })}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">All Payment Status</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Failed">Failed</option>
                <option value="Refunded">Refunded</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Order</th>
                  <th className="text-left py-3 px-4">Customer</th>
                  <th className="text-left py-3 px-4">Items</th>
                  <th className="text-left py-3 px-4">Total</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Payment</th>
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    onViewDetails={() => {
                      setSelectedOrder(order)
                      setShowOrderDetail(true)
                    }}
                    onUpdateStatus={onUpdateOrderStatus}
                    onCancel={() => onCancelOrder(order.id)}
                  />
                ))}
              </tbody>
            </table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                <p className="text-gray-600">
                  {searchQuery || filters.status || filters.paymentStatus
                    ? 'No orders match your filters.'
                    : 'No orders have been placed yet.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Order Detail Modal */}
      <Dialog open={showOrderDetail} onOpenChange={setShowOrderDetail}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <OrderDetail
              order={selectedOrder}
              onUpdateStatus={onUpdateOrderStatus}
              onUpdateTracking={onUpdateTracking}
              onClose={() => setShowOrderDetail(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function OrderRow({ 
  order, 
  onViewDetails, 
  onUpdateStatus, 
  onCancel 
}: {
  order: Order
  onViewDetails: () => void
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
  onCancel: () => void
}) {
  const [showActions, setShowActions] = useState(false)

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return 'bg-yellow-100 text-yellow-800'
      case OrderStatus.Paid:
        return 'bg-green-100 text-green-800'
      case OrderStatus.AwaitingFulfillment:
        return 'bg-blue-100 text-blue-800'
      case OrderStatus.Shipped:
        return 'bg-purple-100 text-purple-800'
      case OrderStatus.Delivered:
        return 'bg-green-100 text-green-800'
      case OrderStatus.Cancelled:
      case OrderStatus.Failed:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4">
        <div>
          <p className="font-medium text-gray-900">#{order.orderNumber}</p>
          {order.trackingNumber && (
            <p className="text-sm text-gray-600">Track: {order.trackingNumber}</p>
          )}
        </div>
      </td>
      <td className="py-3 px-4">
        <div>
          <p className="font-medium text-gray-900">{order.user?.name || 'Guest'}</p>
          <p className="text-sm text-gray-600">{order.user?.email}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600">{order.items.length} items</span>
      </td>
      <td className="py-3 px-4">
        <span className="font-medium text-gray-900">{formatPrice(order.total)}</span>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
          order.paymentStatus === 'Failed' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {order.paymentStatus}
        </span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
      </td>
      <td className="py-3 px-4">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-40">
              <button
                onClick={() => {
                  onViewDetails()
                  setShowActions(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                View Details
              </button>
              
              {order.status === OrderStatus.Paid && (
                <button
                  onClick={() => {
                    onUpdateStatus(order.id, OrderStatus.AwaitingFulfillment)
                    setShowActions(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                >
                  <Package className="w-4 h-4" />
                  Fulfill
                </button>
              )}
              
              {order.status === OrderStatus.AwaitingFulfillment && (
                <button
                  onClick={() => {
                    onUpdateStatus(order.id, OrderStatus.Shipped)
                    setShowActions(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-purple-600 hover:bg-purple-50"
                >
                  <Truck className="w-4 h-4" />
                  Ship
                </button>
              )}
              
              {order.status === OrderStatus.Shipped && (
                <button
                  onClick={() => {
                    onUpdateStatus(order.id, OrderStatus.Delivered)
                    setShowActions(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-green-600 hover:bg-green-50"
                >
                  <CheckCircle className="w-4 h-4" />
                  Mark Delivered
                </button>
              )}
              
              {[OrderStatus.Pending, OrderStatus.Paid].includes(order.status) && (
                <button
                  onClick={() => {
                    onCancel()
                    setShowActions(false)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}

function OrderDetail({ 
  order, 
  onUpdateStatus, 
  onUpdateTracking, 
  onClose 
}: {
  order: Order
  onUpdateStatus: (orderId: string, status: OrderStatus) => void
  onUpdateTracking: (orderId: string, trackingNumber: string) => void
  onClose: () => void
}) {
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '')

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h2>
          <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <div className="text-right">
          <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800`}>
            {order.status}
          </span>
          <p className="text-2xl font-bold text-gray-900 mt-2">{formatPrice(order.total)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Items */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      {item.product.images[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(item.total)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.status === OrderStatus.Paid && (
                <Button
                  onClick={() => onUpdateStatus(order.id, OrderStatus.AwaitingFulfillment)}
                  className="w-full"
                >
                  Mark as Awaiting Fulfillment
                </Button>
              )}
              
              {order.status === OrderStatus.AwaitingFulfillment && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tracking Number
                    </label>
                    <Input
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      if (trackingNumber) {
                        onUpdateTracking(order.id, trackingNumber)
                      }
                      onUpdateStatus(order.id, OrderStatus.Shipped)
                    }}
                    className="w-full"
                  >
                    Mark as Shipped
                  </Button>
                </div>
              )}
              
              {order.status === OrderStatus.Shipped && (
                <Button
                  onClick={() => onUpdateStatus(order.id, OrderStatus.Delivered)}
                  className="w-full"
                >
                  Mark as Delivered
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{order.user?.name || 'Guest'}</p>
                    <p className="text-sm text-gray-600">{order.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <p className="text-sm">{order.shippingAddress.phone}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="font-medium">{order.paymentMethod}</p>
                    <p className="text-sm text-gray-600">{order.paymentStatus}</p>
                  </div>
                </div>
                {order.paymentId && (
                  <p className="text-sm text-gray-600">Payment ID: {order.paymentId}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatPrice(order.tax)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(order.discount)}</span>
                  </div>
                )}
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
