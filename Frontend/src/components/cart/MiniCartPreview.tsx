'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';
import { formatPrice } from '@/lib/utils';

// Helper function to parse variant attributes (matching ClientProductView)
const parseAttributes = (attributes: Record<string, unknown> | null | undefined): Record<string, string> => {
  if (!attributes) return {};
  
  // Nếu là string JSON, parse nó
  if (typeof attributes === 'string') {
    try {
      return JSON.parse(attributes);
    } catch {
      return {};
    }
  }
  
  // Nếu là object, convert values thành string
  const result: Record<string, string> = {};
  Object.entries(attributes).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      result[key] = String(value);
    }
  });
  return result;
};

// Helper function to format attributes for display
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

interface MiniCartPreviewProps {
  maxItems?: number;
}

export default function MiniCartPreview({ maxItems = 4 }: MiniCartPreviewProps) {
  const { cart, getTotal, getItemCount } = useCartStore();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Không chọn sản phẩm nào khi mở cart
  useEffect(() => {
    setSelectedIds([]);
  }, [cart]);

  if (!cart || cart.items.length === 0) {
    return (
      <div className="w-80 p-4 text-center text-gray-500 text-sm bg-white border border-gray-200 rounded-lg shadow-lg">
        <div className="mb-2">🛒</div>
        <p>Giỏ hàng trống</p>
      </div>
    );
  }

  const displayItems = cart.items.slice(0, maxItems);
  const remainingCount = Math.max(0, cart.items.length - maxItems);
  const total = getTotal();
  const itemCount = getItemCount();

  return (
    <div className="w-80 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Giỏ hàng</h3>
          <span className="text-sm text-gray-500">({itemCount} sản phẩm)</span>
        </div>
      </div>

      {/* Items */}
      {/* Select All Checkbox */}
      <div className="flex items-center px-4 py-2 border-b border-gray-100 bg-gray-50">
        <input
          type="checkbox"
          checked={displayItems.every(item => selectedIds.includes(item.id))}
          onChange={e => {
            if (e.target.checked) {
              setSelectedIds(displayItems.map(item => item.id));
            } else {
              setSelectedIds([]);
            }
          }}
          className="mr-2 accent-black"
          aria-label="Chọn tất cả sản phẩm để thanh toán"
        />
        <span className="text-sm text-gray-700">Chọn tất cả</span>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {displayItems.map((item) => (
          <div key={item.id} className="flex gap-3 p-3 border-b border-gray-50 last:border-b-0 items-center">
            {/* Checkbox for selection */}
            <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedIds((prev: string[]) => [...prev, item.id]);
                } else {
                  setSelectedIds((prev: string[]) => prev.filter((id: string) => id !== item.id));
                }
              }}
              className="mr-2 accent-black"
              aria-label={`Chọn sản phẩm ${item.product.name} để thanh toán`}
            />
            {/* Product Image */}
            <Link href={`/products/${item.product.slug}`}>
              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer">
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
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Hide image and show placeholder
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent && !parent.querySelector('.placeholder')) {
                            const placeholder = document.createElement('div');
                            placeholder.className = 'placeholder w-full h-full flex items-center justify-center text-gray-400 text-xs';
                            placeholder.textContent = '📦';
                            parent.appendChild(placeholder);
                          }
                        }}
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
            </Link>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <Link href={`/products/${item.product.slug}`}>
                <h4 className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors cursor-pointer">
                  {item.product.name}
                </h4>
              </Link>

              {/* Variant attributes */}
              {item.variant.attributes && Object.keys(item.variant.attributes).length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 truncate">
                    {formatVariantAttributes(item.variant.attributes)}
                  </p>
                </div>
              )}

              {/* Price and Quantity */}
              <div className="flex items-center justify-between mt-1">
                <span className="text-sm font-semibold text-gray-900">
                  {formatPrice(item.variant.price)}
                </span>
                <span className="text-xs text-gray-500">
                  x{item.quantity}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Show remaining items count */}
      {remainingCount > 0 && (
        <div className="px-4 py-2 bg-gray-50 text-center">
          <span className="text-xs text-gray-600">
            và {remainingCount} sản phẩm khác
          </span>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-900">Tổng cộng:</span>
          <span className="font-semibold text-gray-900">{formatPrice(total)}</span>
        </div>
        <div className="flex gap-2">
          <Link
            href="/cart"
            className="flex-1 text-center bg-white border border-gray-300 text-gray-700 py-2 px-3 rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            Xem giỏ hàng
          </Link>
          {/* Disable checkout if no items selected */}
          <Link
            href={selectedIds.length > 0 ? {
              pathname: '/checkout',
              query: { items: selectedIds.join(',') }
            } : "#"}
            className={`flex-1 text-center py-2 px-3 rounded-lg text-sm transition-colors ${selectedIds.length > 0 ? 'bg-black text-white hover:bg-gray-800' : 'bg-gray-300 text-gray-400 cursor-not-allowed'}`}
            aria-disabled={selectedIds.length === 0}
            tabIndex={selectedIds.length === 0 ? -1 : 0}
            onClick={e => {
              if (selectedIds.length === 0) {
                e.preventDefault();
              }
            }}
          >
            Thanh toán
          </Link>
        </div>
      </div>
    </div>
  );
}
