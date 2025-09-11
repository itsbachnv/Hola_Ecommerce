'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { useState, useEffect } from 'react';

export default function GlamHeroSplit() {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className='relative w-full' style={{ backgroundColor: 'transparent' }}>
      {/* subtle top glow */}
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute -inset-x-20 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_60%)]' />
      </div>

      <div className='mx-auto max-w-[1440px] px-4 md:px-16 lg:px-24 py-10'>
        <div className='flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12'>
          {/* Left: Image */}
          {mounted ? (
            <motion.div
              initial={{ opacity: 0, x: prefersReduced ? 0 : -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 140, damping: 18 }}
              className='w-full md:w-1/2 relative'
            >
              <div className='relative aspect-[3/2] overflow-hidden rounded-3xl ring-1 ring-black/10'>
                <Image
                  src='/images/shoes-hero-2.jpg'
                  alt='Interior'
                  fill
                  priority={false}
                  className='object-cover transition-transform duration-700 hover:scale-[1.03]'
                  sizes='(min-width: 768px) 50vw, 100vw'
                />
                <div className='absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.18)]' />
                {/* floating badge */}
                <div className='absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-900 ring-1 ring-black/10'>
                  Eco Choice
                </div>
              </div>
            </motion.div>
          ) : (
            <div className='w-full md:w-1/2 relative'>
              <div className='relative aspect-[3/2] overflow-hidden rounded-3xl ring-1 ring-black/10'>
                <Image
                  src='/images/shoes-hero-2.jpg'
                  alt='Interior'
                  fill
                  priority={false}
                  className='object-cover transition-transform duration-700 hover:scale-[1.03]'
                  sizes='(min-width: 768px) 50vw, 100vw'
                />
                <div className='absolute inset-0 shadow-[inset_0_0_80px_rgba(0,0,0,0.18)]' />
                {/* floating badge */}
                <div className='absolute left-4 top-4 rounded-full bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-900 ring-1 ring-black/10'>
                  Eco Choice
                </div>
              </div>
            </div>
          )}

          {/* Right: Content */}
          {mounted ? (
            <motion.div
              initial={{ opacity: 0, x: prefersReduced ? 0 : 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 140, damping: 18 }}
              className='w-full md:w-1/2 text-center md:text-left'
            >
              <p className='text-xs md:text-sm tracking-widest uppercase text-gray-500 mb-2'>
                Sản phẩm giày cho phong cách và sự thoải mái
              </p>
              <h1 className='text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight'>
                Bước chân vững chắc tới tương lai
              </h1>
              <p className='text-gray-600 mb-6 max-w-xl md:max-w-none md:pr-6'>
                Hãy để mỗi bước đi thể hiện cá tính của bạn. Giày đẹp không chỉ nâng niu đôi chân mà còn truyền cảm hứng cho cuộc sống năng động mỗi ngày.
              </p>

              {/* CTA row */}
              <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
                <Link
                  href='/booking'
                  className='group inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-white ring-1 ring-gray-900 hover:bg-gray-800 transition'
                >
                  Liên Hệ Chúng Tôi
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='transition group-hover:translate-x-0.5'>
                    <path d='M5 12h14M13 5l7 7-7 7' />
                  </svg>
                </Link>
                <Link
                  href='/catalog'
                  className='inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 ring-1 ring-gray-300 text-gray-800 hover:bg-gray-50 transition'
                >
                  Mở Danh Mục
                </Link>
              </div>

              {/* mini stats */}
              <div className='mt-6 grid grid-cols-3 gap-3 text-center md:text-left'>
                {[
                  ['4.8★', 'Customer rating'],
                  ['48h', 'Fast delivery'],
                  ['Eco', 'Low VOC']
                ].map(([a,b]) => (
                  <div key={a} className='rounded-2xl bg-gray-50 px-3 py-2 ring-1 ring-gray-200'>
                    <div className='text-lg font-bold text-gray-900'>{a}</div>
                    <div className='text-xs text-gray-500'>{b}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className='w-full md:w-1/2 text-center md:text-left'>
              <p className='text-xs md:text-sm tracking-widest uppercase text-gray-500 mb-2'>
                Sản phẩm giày cho phong cách và sự thoải mái
              </p>
              <h1 className='text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight'>
                Bước chân vững chắc tới tương lai
              </h1>
              <p className='text-gray-600 mb-6 max-w-xl md:max-w-none md:pr-6'>
                Hãy để mỗi bước đi thể hiện cá tính của bạn. Giày đẹp không chỉ nâng niu đôi chân mà còn truyền cảm hứng cho cuộc sống năng động mỗi ngày.
              </p>

              {/* CTA row */}
              <div className='flex flex-col sm:flex-row items-center gap-3 sm:gap-4'>
                <Link
                  href='/booking'
                  className='group inline-flex items-center justify-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-white ring-1 ring-gray-900 hover:bg-gray-800 transition'
                >
                  Liên Hệ Chúng Tôi
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='transition group-hover:translate-x-0.5'>
                    <path d='M5 12h14M13 5l7 7-7 7' />
                  </svg>
                </Link>
                <Link
                  href='/catalog'
                  className='inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 ring-1 ring-gray-300 text-gray-800 hover:bg-gray-50 transition'
                >
                  Mở Danh Mục
                </Link>
              </div>

              {/* mini stats */}
              <div className='mt-6 grid grid-cols-3 gap-3 text-center md:text-left'>
                {[
                  ['4.8★', 'Customer rating'],
                  ['48h', 'Fast delivery'],
                  ['Eco', 'Low VOC']
                ].map(([a,b]) => (
                  <div key={a} className='rounded-2xl bg-gray-50 px-3 py-2 ring-1 ring-gray-200'>
                    <div className='text-lg font-bold text-gray-900'>{a}</div>
                    <div className='text-xs text-gray-500'>{b}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

