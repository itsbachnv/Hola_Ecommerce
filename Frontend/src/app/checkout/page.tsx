'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotal, getItemCount } = useCartStore();
  const { user, token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if cart has items (no need to check login)
    if (!cart || cart.items.length === 0) {
      router.push('/products');
      return;
    }

    setIsLoading(false);
  }, [cart, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Thanh toán</h1>
          <p className="mt-2 text-gray-600">
            Hoàn tất đơn hàng của bạn với {getItemCount()} sản phẩm
          </p>
          {!user && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                💡 <strong>Tip:</strong> Bạn có thể{' '}
                <a href="/auth/login?redirect=/checkout" className="underline font-medium">
                  đăng nhập
                </a>
                {' '}để lưu thông tin và theo dõi đơn hàng dễ dàng hơn.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Checkout Form */}
          <div>
            <CheckoutForm />
          </div>

          {/* Right: Order Summary */}
          <div>
            <CheckoutSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
