'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';

type Rating = { rate: number; count: number };
type Product = {
  id?: number;
  title: string;
  description: string;
  price: number;
  category?: string;
  rating?: Rating;
  image: string;
  images?: string[]; // optional: nếu có mảng ảnh thì dùng gallery
};

export default function ClientProductView({ product }: { product: Product }) {
  const prefersReduced = useReducedMotion();
  const gallery = useMemo(
    () => (product.images && product.images.length > 0 ? product.images : [product.image]),
    [product.images, product.image]
  );

  const [active, setActive] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const handleQuantity = (type: 'inc' | 'dec') => {
    setQuantity((q) => Math.max(1, type === 'inc' ? q + 1 : q - 1));
  };

  const subtotal = useMemo(() => (product.price * quantity).toFixed(2), [product.price, quantity]);

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
            alt={product.title}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            priority={true}
          />
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.08)]" />
          {/* quick info pill */}
          {product.category && (
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ring-1 ring-black/10">
              {product.category}
            </span>
          )}
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
                <Image src={src} alt={`${product.title} ${i + 1}`} fill className="object-cover" sizes="20vw" />
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
            {product.title}
          </h1>

          {/* rating */}
          {product.rating && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Stars value={product.rating.rate} />
              <span className="font-medium">{product.rating.rate.toFixed(1)}</span>
              <span className="text-gray-400">•</span>
              <span>{product.rating.count} reviews</span>
            </div>
          )}
        </div>

        <p className="text-gray-700">{product.description}</p>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Price</span>
            <span className="text-red-600 font-semibold text-lg">Rs. {product.price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Availability</span>
            <span className="text-green-600">In stock</span>
          </div>
          {product.category && (
            <div className="flex justify-between">
              <span className="text-gray-600">Category</span>
              <span>{product.category}</span>
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="flex flex-wrap items-center gap-3 mt-4">
          <span className="text-sm text-gray-600">Quantity</span>
          <div className="flex items-center overflow-hidden rounded-full ring-1 ring-gray-300">
            <button
              onClick={() => handleQuantity('dec')}
              className="px-4 py-2 hover:bg-gray-50"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="px-5 py-2 min-w-10 text-center">{quantity}</span>
            <button
              onClick={() => handleQuantity('inc')}
              className="px-4 py-2 hover:bg-gray-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        {/* Subtotal */}
        <div className="text-lg font-medium mt-2">
          Subtotal: <span className="text-red-600">Rs. {subtotal}</span>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-3 mt-6">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-black px-6 py-3 font-semibold text-white hover:bg-black/90"
            onClick={() => {
              // TODO: Thêm vào giỏ
            }}
          >
            🛒 Thêm vào giỏ
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-900 px-6 py-3 font-semibold hover:bg-gray-900 hover:text-white">
            ♡ Add to Wishlist
          </button>
          <button className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 font-semibold text-white hover:bg-red-700">
            Buy it now
          </button>
        </div>

        {/* Trust / Social proof */}
        <div className="text-xs text-gray-500 mt-2 leading-relaxed">
          REAL TIME 🔴 <span className="text-red-600 font-semibold">+25</span> visitors right now
          <br />
          🔒 Secure checkout • 🚚 Fast delivery • ↩️ Easy returns
        </div>

        {/* Share */}
        <div className="text-xs text-gray-500">
          SHARE ON:
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

function Stars({ value = 0 }: { value?: number }) {
  const v = Math.max(0, Math.min(5, value));
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = i + 1 <= Math.floor(v);
        const half = !fill && i + 0.5 < v;
        return (
          <svg key={i} width="16" height="16" viewBox="0 0 24 24" className="mr-0.5 text-amber-500">
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 17.3l-6.16 3.64 1.64-6.98L2 8.9l7.08-.6L12 1.8l2.92 6.5 7.08.6-5.48 5.06 1.64 6.98z"
              fill={fill ? 'currentColor' : half ? `url(#half-${i})` : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        );
      })}
    </div>
  );
}

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
