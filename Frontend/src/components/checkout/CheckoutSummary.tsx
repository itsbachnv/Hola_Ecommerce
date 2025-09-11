'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';
import { formatPrice } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

// Helper function to parse variant attributes
const parseAttributes = (attributes: Record<string, unknown> | null | undefined): Record<string, string> => {
  if (!attributes) return {};
  
  if (typeof attributes === 'string') {
    try {
      return JSON.parse(attributes);
    } catch {
      return {};
    }
  }
  
  const result: Record<string, string> = {};
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      result[key] = String(value);
    }
  });
  return result;
};

const formatVariantAttributes = (attributes: Record<string, unknown>): string => {
  const parsed = parseAttributes(attributes);
  const formatted: string[] = [];
  
  Object.entries(parsed).forEach(([key, value]) => {
    if (key === 'color') {
      formatted.push(`Màu: ${value}`);
    } else if (key === 'size') {
      formatted.push(`Size: ${value}`);
    } else {
      formatted.push(`${key}: ${value}`);
    }
  });
  
  return formatted.join(', ');
};

export default function CheckoutSummary() {
  const { cart, getTotal, getItemCount } = useCartStore();

  if (!cart || cart.items.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <p>Không có sản phẩm trong giỏ hàng</p>
        </CardContent>
      </Card>
    );
  }

  const subtotal = getTotal();
  const shippingFee = 30000; // 30k VND
  const total = subtotal + shippingFee;
  const itemCount = getItemCount();

  return (
    <div className="space-y-6">
      {/* Order Summary */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Đơn hàng của bạn</h2>
          
          {/* Items */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {cart.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                {/* Product Image */}
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {(() => {
                    const primaryImage = item.product.primaryImageUrl;
                    const fallbackImage = item.product.images?.[0];
                    const imageUrl = primaryImage || 
                      (typeof fallbackImage === 'string' ? fallbackImage : fallbackImage?.url);
                    
                    if (imageUrl) {
                      return (
                        <Image
                          src={imageUrl}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      );
                    }
                    
                    return (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">
                        📦
                      </div>
                    );
                  })()}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {item.product.name}
                  </h3>
                  
                  {/* Variant attributes */}
                  {item.variant.attributes && Object.keys(item.variant.attributes).length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatVariantAttributes(item.variant.attributes)}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">
                      {formatPrice(item.variant.price)} x {item.quantity}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.variant.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tạm tính ({itemCount} sản phẩm):</span>
              <span className="font-medium">{formatPrice(subtotal)}</span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Phí vận chuyển:</span>
              <span className="font-medium">{formatPrice(shippingFee)}</span>
            </div>
            
            <div className="flex items-center justify-between text-lg font-semibold pt-2 border-t border-gray-200">
              <span>Tổng cộng:</span>
              <span className="text-black">{formatPrice(total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shipping Info */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-3">Thông tin vận chuyển</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Phí vận chuyển:</span>
              <span className="font-medium">{formatPrice(shippingFee)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Thời gian giao hàng:</span>
              <span className="font-medium">2-3 ngày làm việc</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Đơn vị vận chuyển:</span>
              <span className="font-medium">Giao hàng nhanh</span>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Lưu ý:</strong> Đơn hàng sẽ được xử lý trong vòng 24h và giao trong 2-3 ngày làm việc.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Policies */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold mb-3">Chính sách</h3>
          
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Miễn phí đổi trả trong 7 ngày</span>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Bảo hành sản phẩm theo nhà sản xuất</span>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Hỗ trợ khách hàng 24/7</span>
            </div>
            
            <div className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>Thanh toán an toàn và bảo mật</span>
            </div>
          </div>
          
          <div className="mt-4">
            <Link 
              href="/policies" 
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Xem chi tiết chính sách →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
