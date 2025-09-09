'use client'

import { useState } from 'react'
import { Order, OrderStatus } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/Button'
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search,
  ChevronRight,
  MapPin
} from 'lucide-react'

interface OrderTrackingProps {
  orders?: Order[]
  onSearchOrder: (orderNumber: string) => void
  isLoading?: boolean
}

export default function OrderTracking({ 
  orders = [], 
  onSearchOrder, 
  isLoading = false 
}: OrderTrackingProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      onSearchOrder(searchQuery.trim())
    }
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

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={() => setSelectedOrder(null)} />
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Track Your Orders</h1>

      {/* Search */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Enter order number or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Orders List */}
      {orders.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Your Orders</h2>
          {orders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent 
                className="p-6"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(order.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {formatPrice(order.total)}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                <div className="mt-4 flex items-center space-x-6 text-sm text-gray-600">
                  <span>{order.items.length} item(s)</span>
                  <span>•</span>
                  <span>Payment: {order.paymentMethod}</span>
                  {order.trackingNumber && (
                    <>
                      <span>•</span>
                      <span>Tracking: {order.trackingNumber}</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {searchQuery 
                ? 'No orders match your search criteria. Please check your order number or email.'
                : 'You haven\'t placed any orders yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function OrderDetail({ order, onBack }: { order: Order; onBack: () => void }) {
  const getOrderProgress = (status: OrderStatus) => {
    const statuses = [
      OrderStatus.Pending,
      OrderStatus.Paid,
      OrderStatus.AwaitingFulfillment,
      OrderStatus.Shipped,
      OrderStatus.Delivered
    ]
    
    return statuses.indexOf(status) + 1
  }

  const progress = getOrderProgress(order.status)
  const isCompleted = order.status === OrderStatus.Delivered
  const isCancelled = order.status === OrderStatus.Cancelled || order.status === OrderStatus.Failed

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={onBack}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">
          Order #{order.orderNumber}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Progress */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              {!isCancelled ? (
                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="relative">
                    <div className="absolute top-4 left-8 right-8 h-0.5 bg-gray-200">
                      <div 
                        className="h-full bg-green-500 transition-all duration-500"
                        style={{ width: `${((progress - 1) / 4) * 100}%` }}
                      />
                    </div>
                    
                    <div className="relative flex justify-between">
                      {[
                        { status: 'Order Placed', icon: CheckCircle },
                        { status: 'Payment Confirmed', icon: CheckCircle },
                        { status: 'Preparing', icon: Package },
                        { status: 'Shipped', icon: Truck },
                        { status: 'Delivered', icon: CheckCircle }
                      ].map((step, index) => {
                        const isActive = index < progress
                        const isCurrent = index === progress - 1
                        
                        return (
                          <div key={step.status} className="flex flex-col items-center">
                            <div className={`
                              w-8 h-8 rounded-full flex items-center justify-center text-white
                              ${isActive ? 'bg-green-500' : isCurrent ? 'bg-blue-500' : 'bg-gray-300'}
                            `}>
                              <step.icon className="w-4 h-4" />
                            </div>
                            <span className="text-xs mt-2 text-center max-w-16">{step.status}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="font-medium">Order placed</p>
                        <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                      </div>
                    </div>
                    
                    {order.status !== OrderStatus.Pending && (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <div>
                          <p className="font-medium">Payment confirmed</p>
                          <p className="text-sm text-gray-600">Payment received via {order.paymentMethod}</p>
                        </div>
                      </div>
                    )}
                    
                    {order.shippedAt && (
                      <div className="flex items-center gap-3">
                        <Truck className="w-5 h-5 text-purple-500" />
                        <div>
                          <p className="font-medium">Order shipped</p>
                          <p className="text-sm text-gray-600">
                            {formatDate(order.shippedAt)}
                            {order.trackingNumber && ` • Tracking: ${order.trackingNumber}`}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {order.deliveredAt && (
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium">Order delivered</p>
                          <p className="text-sm text-gray-600">{formatDate(order.deliveredAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Order {order.status}
                  </h3>
                  <p className="text-gray-600">
                    This order has been {order.status.toLowerCase()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
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
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.phone}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>
                    {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}
                  </p>
                  {order.shippingAddress.postalCode && (
                    <p>{order.shippingAddress.postalCode}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {order.trackingNumber && (
            <Card>
              <CardHeader>
                <CardTitle>Tracking Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Tracking Number</p>
                  <p className="font-mono text-lg font-semibold">{order.trackingNumber}</p>
                  <Button variant="outline" className="mt-4" size="sm">
                    Track Package
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
