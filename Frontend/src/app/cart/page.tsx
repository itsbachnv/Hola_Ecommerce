'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ShoppingCart from '@/components/cart/ShoppingCart';

export default function CartPage() {
  const [isCartOpen, setIsCartOpen] = useState(true);
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ShoppingCart
        isOpen={isCartOpen}
        onCheckout={handleCheckout}
      />
      
      {!isCartOpen && (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Giỏ hàng</h1>
            <button
              onClick={() => setIsCartOpen(true)}
              className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
            >
              Mở giỏ hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
