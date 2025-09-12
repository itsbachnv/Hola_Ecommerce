'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useLoadingStore } from '@/stores/loading'
import { Product as StoreProduct, ProductVariant as StoreProductVariant } from '@/types';

type ProductImage = {
  id: number;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
};

type ProductVariant = {
  id: number;
  productId: number;
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stockQty: number;
  weightGrams?: number;
  attributes: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  productName: string;
};

type Product = {
  id: number;
  name: string;
  description: string;
  slug: string;
  categoryId: number;
  categoryName: string;
  brandId: number;
  brandName: string;
  status: string;
  attributes?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  images: ProductImage[];
  primaryImageUrl: string;
  variants: ProductVariant[];
  minPrice: number;
  maxPrice: number;
};

export default function ClientProductView({ product }: { product: Product }) {
  const prefersReduced = useReducedMotion();
  const { addItem } = useCartStore();
  const { token, user } = useAuthStore();
  const { showToast } = useToastStore();
  const { setLoading, clearLoading } = useLoadingStore();
  
  // Lấy danh sách ảnh từ API
  const gallery = useMemo(() => {
    if (product.images && product.images.length > 0) {
      return product.images.map(img => img.url);
    }
    return [product.primaryImageUrl];
  }, [product.images, product.primaryImageUrl]);

  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Parse attributes từ JSON string hoặc object
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

  // Lấy tất cả màu có sẵn
  const availableColors = useMemo(() => {
    const colors = new Set<string>();
    product.variants.forEach(variant => {
      if (variant.stockQty > 0 && variant.attributes) {
        const attrs = parseAttributes(variant.attributes);
        if (attrs.color) {
          colors.add(attrs.color);
        }
      }
    });
    return Array.from(colors);
  }, [product.variants]);

  // Lấy size có sẵn cho màu đã chọn
  const availableSizes = useMemo(() => {
    if (!selectedColor) return [];
    
    const sizes = new Set<string>();
    product.variants.forEach(variant => {
      if (variant.stockQty > 0 && variant.attributes) {
        const attrs = parseAttributes(variant.attributes);
        if (attrs.color === selectedColor && attrs.size) {
          sizes.add(attrs.size);
        }
      }
    });
    return Array.from(sizes);
  }, [product.variants, selectedColor]);

  // Xử lý chọn màu
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
    setSelectedSize(''); // Reset size khi đổi màu
    
    // Tìm variant đầu tiên của màu này
    const firstVariantOfColor = product.variants.find(variant => {
      if (variant.stockQty > 0 && variant.attributes) {
        const attrs = parseAttributes(variant.attributes);
        return attrs.color === color;
      }
      return false;
    });
    
    if (firstVariantOfColor) {
      setSelectedVariant(firstVariantOfColor);
    }
  };

  // Xử lý chọn size
  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    
    // Tìm variant chính xác với màu và size
    const exactVariant = product.variants.find(variant => {
      if (variant.stockQty > 0 && variant.attributes) {
        const attrs = parseAttributes(variant.attributes);
        return attrs.color === selectedColor && attrs.size === size;
      }
      return false;
    });
    
    if (exactVariant) {
      setSelectedVariant(exactVariant);
    }
  };

  const handleQuantity = (type: 'inc' | 'dec') => {
    setQuantity((q) => Math.max(1, type === 'inc' ? q + 1 : q - 1));
  };

  // Kiểm tra xem có thể mua không (đã chọn đủ variant)
  const canPurchase = useMemo(() => {
    if (availableColors.length === 0) return true; // Không có variant thì mua được
    if (!selectedColor) return false; // Phải chọn màu
    if (availableSizes.length > 0 && !selectedSize) return false; // Nếu có size thì phải chọn size
    return selectedVariant.stockQty > 0; // Còn hàng
  }, [availableColors.length, selectedColor, availableSizes.length, selectedSize, selectedVariant.stockQty]);

  // Xử lý thêm vào giỏ hàng
  const handleAddToCart = async () => {
    try {
      setLoading(true, 'Đang thêm sản phẩm vào giỏ hàng...', 'creating');
      
      // Convert through unknown to handle type compatibility
      await addItem(
        product as unknown as StoreProduct, 
        selectedVariant as unknown as StoreProductVariant, 
        quantity, 
        token || undefined,
        user?.id
      );
      
      // Show success toast
      showToast(
        `Đã thêm ${quantity} sản phẩm "${product.name}" vào giỏ hàng!`,
        'success'
      );
    } catch (error) {
      showToast('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng!', 'error');
    } finally {
      clearLoading();
    }
  };  const subtotal = useMemo(() => selectedVariant.price * quantity, [selectedVariant.price, quantity]);

  return (
    <section className="w-full max-w-[1200px] mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-2 gap-12">
      {/* LEFT: Gallery */}
      <motion.div
        initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4"
      >
        {/* Main image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl ring-1 ring-black/10 bg-white group">
          <Image
            key={gallery[active]}
            src={gallery[active]}
            alt={product.name}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            priority={true}
          />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.08)]" />
          {/* quick info pill */}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ring-1 ring-black/10">
            {product.categoryName}
          </span>
        </div>

        {/* Thumbnails */}
        {gallery.length > 1 && (
          <div className="grid grid-cols-5 gap-3">
            {gallery.map((src, i) => (
              <button
                key={src + i}
                onClick={() => setActive(i)}
                className={`relative aspect-square overflow-hidden rounded-xl ring-1 transition ${
                  i === active ? 'ring-gray-900' : 'ring-black/10 hover:ring-gray-400'
                }`}
                aria-label={`View image ${i + 1}`}
              >
                <Image src={src} alt={`${product.name} ${i + 1}`} fill className="object-cover" sizes="20vw" />
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* RIGHT: Info */}
      <motion.div
        initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.05 }}
        className="space-y-6"
      >
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-extrabold leading-tight text-gray-900">
            {product.name}
          </h1>

          {/* SKU và Brand */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">SKU: {selectedVariant.sku}</span>
            <span className="text-gray-400">•</span>
            <span>Thương hiệu: {product.brandName}</span>
          </div>
        </div>

        <p className="text-gray-700">{product.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Giá bán</span>
            <span className="text-red-600 font-semibold text-lg">{selectedVariant.price.toLocaleString('vi-VN')} VND</span>
          </div>
          {selectedVariant.compareAtPrice && (
            <div className="flex justify-between">
              <span className="text-gray-600">Giá gốc</span>
              <span className="text-gray-500 line-through">{selectedVariant.compareAtPrice.toLocaleString('vi-VN')} VND</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Tình trạng</span>
            <span className={selectedVariant.stockQty > 0 ? "text-green-600" : "text-red-600"}>
              {selectedVariant.stockQty > 0 ? `Còn ${selectedVariant.stockQty} sản phẩm` : 'Hết hàng'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Danh mục</span>
            <span>{product.categoryName}</span>
          </div>
        </div>

        {/* Variant Selection */}
        {(availableColors.length > 0) && (
          <div className="space-y-4 border-t pt-4">
            {/* Color Selection */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-900">Màu sắc:</span>
                {selectedColor && (
                  <span className="text-sm text-gray-600">({selectedColor})</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`px-3 py-2 text-sm border rounded-lg transition-all ${
                      selectedColor === color
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                        : 'border-gray-300 hover:border-gray-400 bg-white'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selection - chỉ hiển thị khi đã chọn màu */}
            {selectedColor && availableSizes.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900">Kích thước:</span>
                  {selectedSize && (
                    <span className="text-sm text-gray-600">({selectedSize})</span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => handleSizeSelect(size)}
                      className={`px-3 py-2 text-sm border rounded-lg transition-all ${
                        selectedSize === size
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium'
                          : 'border-gray-300 hover:border-gray-400 bg-white'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quantity */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <span className="text-sm text-gray-600">Số lượng</span>
          <div className="flex items-center overflow-hidden rounded-full ring-1 ring-gray-300">
            <button
              onClick={() => handleQuantity('dec')}
              className="px-4 py-2 hover:bg-gray-50"
              aria-label="Giảm số lượng"
            >
              −
            </button>
            <span className="px-5 py-2 min-w-10 text-center">{quantity}</span>
            <button
              onClick={() => handleQuantity('inc')}
              className="px-4 py-2 hover:bg-gray-50"
              aria-label="Tăng số lượng"
              disabled={quantity >= selectedVariant.stockQty}
            >
              +
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="text-lg font-medium mt-2">
          Tổng tiền: <span className="text-red-600">{subtotal.toLocaleString('vi-VN')} VND</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-3 mt-6">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-black/90 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCart}
            disabled={!canPurchase}
            title={!canPurchase ? 'Vui lòng chọn đầy đủ tùy chọn sản phẩm' : ''}
          >
            🛒 Thêm vào giỏ
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-900 px-6 py-3 font-semibold hover:bg-gray-900 hover:text-white">
            ♡ Yêu thích
          </button>
          <button 
            className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!canPurchase}
            title={!canPurchase ? 'Vui lòng chọn đầy đủ tùy chọn sản phẩm' : ''}
          >
            Mua ngay
          </button>
        </div>

        {/* Trust / Social proof */}
        <div className="text-xs text-gray-500 mt-2 leading-relaxed">
          TRỰC TUYẾN 🔴 <span className="text-red-600 font-semibold">+25</span> người đang xem
          <br />
          🔒 Thanh toán bảo mật • 🚚 Giao hàng nhanh • ↩️ Đổi trả dễ dàng
        </div>

        {/* Share */}
        <div className="text-xs text-gray-500">
          CHIA SẺ:
          <span className="ml-2 inline-flex items-center gap-2 align-middle">
            <Icon name="fb" />
            <Icon name="tw" />
            <Icon name="ig" />
            <Icon name="wa" />
          </span>
        </div>
      </motion.div>
    </section>
  );
}

/* ------- helpers ------- */

function Icon({ name }: { name: 'fb' | 'tw' | 'ig' | 'wa' }) {
  const path =
    name === 'fb'
      ? 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z'
      : name === 'tw'
      ? 'M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 12 7.09v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83z'
      : name === 'ig'
      ? 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 4a6 6 0 1 0 6 6 6 6 0 0 0-6-6zm6.5-1.5a1.5 1.5 0 1 0 1.5 1.5 1.5 1.5 0 0 0-1.5-1.5z'
      : 'M20 4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6l-4 4V7a3 3 0 0 1 3-3h15z';
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-70 hover:opacity-100 transition">
      <path d={path} fill="currentColor" />
    </svg>
  );
}
