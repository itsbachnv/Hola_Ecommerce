'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/stores/auth'

interface NotificationBellProps {
  className?: string
  variant?: 'default' | 'admin'
  notificationCount?: number
}

export default function NotificationBell({ 
  className = '', 
  variant = 'default',
  notificationCount 
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  // Determine notification count based on user role if not provided
  const finalNotificationCount = notificationCount ?? (
    variant === 'admin' && (user?.role === 'Admin' || user?.role === 'Staff') ? 3 : 
    variant === 'default' && user ? 1 : 0
  )

  const baseClasses = variant === 'admin' 
    ? 'p-2 rounded-lg hover:bg-gray-100 relative'
    : 'relative grid h-10 w-10 place-items-center rounded-xl ring-1 ring-black/10 hover:bg-black/5'

  return (
    <div className="relative">
      <button 
        className={`${baseClasses} ${className}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg 
          width={variant === 'admin' ? '20' : '20'} 
          height={variant === 'admin' ? '20' : '20'} 
          viewBox='0 0 24 24' 
          fill='none' 
          stroke='currentColor' 
          strokeWidth='2'
          className={variant === 'admin' ? 'text-gray-600' : ''}
        >
          <path d='M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' />
          <path d='M13.73 21a2 2 0 0 1-3.46 0' />
        </svg>
        
        {/* Notification dot */}
        {finalNotificationCount > 0 && (
          <span className='absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center'>
            {finalNotificationCount > 9 ? (
              <span className="text-[8px] text-white font-bold">9+</span>
            ) : finalNotificationCount > 0 ? (
              <span className="text-[8px] text-white font-bold">{finalNotificationCount}</span>
            ) : null}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
          >
            <div className="p-4 border-b">
              <h3 className="font-semibold text-gray-900">Thông báo</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {finalNotificationCount > 0 ? (
                <div className="p-4">
                  {/* Sample notifications */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Đơn hàng mới</p>
                        <p className="text-xs text-gray-600">Bạn có 1 đơn hàng mới cần xử lý</p>
                        <p className="text-xs text-gray-400 mt-1">5 phút trước</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Sản phẩm được duyệt</p>
                        <p className="text-xs text-gray-600">Sản phẩm Nike Air Max đã được duyệt</p>
                        <p className="text-xs text-gray-400 mt-1">1 giờ trước</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Không có thông báo mới</p>
                </div>
              )}
            </div>
            
            {finalNotificationCount > 0 && (
              <div className="p-3 border-t">
                <button className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Xem tất cả thông báo
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
