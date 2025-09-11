'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ShoppingBag, Home } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function OrderSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 10 seconds if user doesn't take action
    const timer = setTimeout(() => {
      router.push('/products');
    }, 10000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Success Icon */}
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        {/* Success Message */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Đặt hàng thành công!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý và sẽ được giao trong 2-3 ngày làm việc.
        </p>

        {/* Order Info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Mã đơn hàng:</span>
            <span className="font-medium">#{Date.now().toString().slice(-8)}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-600">Thời gian đặt:</span>
            <span className="font-medium">{new Date().toLocaleDateString('vi-VN')}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link href="/orders" className="block">
            <Button variant="outline" className="w-full">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Xem đơn hàng
            </Button>
          </Link>
          
          <Link href="/products" className="block">
            <Button className="w-full">
              <Home className="w-4 h-4 mr-2" />
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>

        {/* Auto redirect notice */}
        <p className="text-xs text-gray-500 mt-6">
          Trang sẽ tự động chuyển hướng sau 10 giây...
        </p>

        {/* Contact Support */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">
            Có thắc mắc về đơn hàng?
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            <Link href="/contact" className="text-blue-600 hover:text-blue-800 underline">
              Liên hệ hỗ trợ
            </Link>
            <span className="text-gray-300">|</span>
            <Link href="tel:1900123456" className="text-blue-600 hover:text-blue-800 underline">
              1900 123 456
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
