'use client'

import { DashboardStats } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  BarChart3,
  Clock,
  CheckCircle,
  Truck
} from 'lucide-react'

interface DashboardProps {
  stats: DashboardStats
  isLoading?: boolean
}

export default function Dashboard({ stats, isLoading = false }: DashboardProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="bg-gray-200 rounded-lg h-80"></div>
            <div className="bg-gray-200 rounded-lg h-80"></div>
          </div>
        </div>
      </div>
    )
  }

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: formatPrice(stats.totalRevenue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+12.5%',
      changeType: 'increase' as const
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toString(),
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+8.2%',
      changeType: 'increase' as const
    },
    {
      title: 'Average Order Value',
      value: formatPrice(stats.averageOrderValue),
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+3.1%',
      changeType: 'increase' as const
    },
    {
      title: 'Conversion Rate',
      value: '3.2%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: '-0.4%',
      changeType: 'decrease' as const
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className={`${card.bgColor} p-3 rounded-full`}>
                  <card.icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <div className="flex items-center mt-1">
                    {card.changeType === 'increase' ? (
                      <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm font-medium ${
                      card.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {card.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.ordersByStatus).map(([status, count]) => {
                const getStatusIcon = () => {
                  switch (status) {
                    case 'Pending':
                      return <Clock className="w-5 h-5 text-yellow-500" />
                    case 'Paid':
                      return <CheckCircle className="w-5 h-5 text-green-500" />
                    case 'Shipped':
                      return <Truck className="w-5 h-5 text-blue-500" />
                    case 'Delivered':
                      return <CheckCircle className="w-5 h-5 text-green-600" />
                    default:
                      return <Package className="w-5 h-5 text-gray-500" />
                  }
                }

                const percentage = stats.totalOrders > 0 ? (count / stats.totalOrders * 100).toFixed(1) : '0'

                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon()}
                      <span className="font-medium text-gray-900">{status}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-900">{count}</span>
                      <span className="text-sm text-gray-500 ml-2">({percentage}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.slice(0, 5).map((item, index) => (
                <div key={item.product.id} className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
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
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.soldQuantity} sold • {formatPrice(item.revenue)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                      {index + 1}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            {/* Simplified chart visualization */}
            <div className="w-full h-full bg-gradient-to-t from-blue-50 to-transparent rounded-lg flex items-end justify-center space-x-2 p-4">
              {stats.revenueChart.slice(0, 15).map((data, index) => {
                const maxRevenue = Math.max(...stats.revenueChart.map(d => d.revenue))
                const height = maxRevenue > 0 ? (data.revenue / maxRevenue) * 100 : 0
                
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-blue-500 rounded-t-sm w-8 transition-all hover:bg-blue-600"
                      style={{ height: `${Math.max(height, 2)}%` }}
                      title={`${data.date}: ${formatPrice(data.revenue)}`}
                    />
                    <span className="text-xs text-gray-500 mt-2 transform -rotate-45 origin-top-left">
                      {new Date(data.date).getDate()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="text-center mt-4 text-sm text-gray-600">
            <p>Hover over bars to see daily revenue</p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Package className="w-6 h-6 text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Add Product</p>
                <p className="text-sm text-gray-600">Create new product</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <ShoppingCart className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Process Orders</p>
                <p className="text-sm text-gray-600">Manage pending orders</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Users className="w-6 h-6 text-purple-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">View Customers</p>
                <p className="text-sm text-gray-600">Customer management</p>
              </div>
            </button>
            
            <button className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <BarChart3 className="w-6 h-6 text-orange-600" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-600">Detailed reports</p>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
