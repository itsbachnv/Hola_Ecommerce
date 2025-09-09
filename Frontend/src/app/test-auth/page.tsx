'use client'

import { useState } from 'react'
import { useAuth } from '@/stores/auth'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestAuthPage() {
  const { user, isAuthenticated, setUser, setToken } = useAuth()
  const [loading, setLoading] = useState(false)

  const testLogin = async (role: 'Admin' | 'Staff' | 'Customer', name: string) => {
    setLoading(true)
    
    // Simulate API response
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockUser = {
      id: Math.random().toString(36),
      name,
      email: `${name.toLowerCase().replace(' ', '')}@test.com`,
      role,
      phone: '0123456789',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const mockToken = 'mock-jwt-token-' + role.toLowerCase()
    
    // Save to localStorage
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('token', mockToken)
    
    // Update store
    setUser(mockUser)
    setToken(mockToken)
    
    setLoading(false)
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-green-600">✅ Đã đăng nhập thành công!</CardTitle>
            <CardDescription>Thông tin người dùng hiện tại</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <strong>Tên:</strong> {user?.name}
            </div>
            <div>
              <strong>Email:</strong> {user?.email}
            </div>
            <div>
              <strong>Vai trò:</strong> 
              <span className={`ml-2 px-2 py-1 rounded text-sm font-medium ${
                user?.role === 'Admin' ? 'bg-red-100 text-red-800' :
                user?.role === 'Staff' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {user?.role}
              </span>
            </div>
            
            <div className="pt-4 space-y-2">
              {(user?.role === 'Admin' || user?.role === 'Staff') && (
                <Button 
                  className="w-full" 
                  onClick={() => window.location.href = '/dashboard'}
                >
                  Đi tới Dashboard
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => window.location.href = '/products'}
              >
                Đi tới Cửa hàng
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>🧪 Test Authentication</CardTitle>
          <CardDescription>
            Chọn vai trò để test hệ thống đăng nhập
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            className="w-full bg-red-600 hover:bg-red-700"
            onClick={() => testLogin('Admin', 'Admin User')}
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập với vai trò Admin'}
          </Button>
          
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => testLogin('Staff', 'Staff User')}
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập với vai trò Staff'}
          </Button>
          
          <Button 
            className="w-full bg-green-600 hover:bg-green-700"
            onClick={() => testLogin('Customer', 'Customer User')}
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập với vai trò Customer'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
