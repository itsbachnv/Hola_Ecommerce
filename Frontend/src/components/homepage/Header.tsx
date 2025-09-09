'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

type Props = {
  cartCount?: number
  promoText?: string
}

export default function GlamHeader({ cartCount = 0, promoText = 'Giảm thêm 10% cho tất cả sản phẩm nhân ngày 2-9' }: Props) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [show, setShow] = useState(true)
  const lastY = useRef(0)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      setScrolled(y > 24)
      setShow(y < 80 || y < lastY.current)
      lastY.current = y
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className='relative z-50'>
      {promoText && (
        <div className='w-full bg-gray-50 text-gray-700 text-xs md:text-sm text-center py-2 tracking-widest uppercase'>
          {promoText}
        </div>
      )}

      <AnimatePresence initial={false}>
        {show && (
          <motion.div
            initial={{ y: -60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -60, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 22 }}
            className={`sticky top-0 w-full backdrop-blur ${scrolled ? 'bg-white/90 shadow-sm' : 'bg-white/60'}`}
          >
            {/* ===== Top bar: 3 columns (auto 1fr auto) ===== */}
            <div className='mx-auto grid max-w-[1440px] grid-cols-[auto_1fr_auto] items-center gap-4 px-4 py-3 md:px-6'>

              {/* Left: hamburger (mobile) + logo */}
              <div className='flex items-center gap-3'>
                <button
                  aria-label={open ? 'Close menu' : 'Open menu'}
                  onClick={() => setOpen(true)}
                  className='grid h-10 w-10 place-items-center rounded-xl ring-1 ring-black/10 bg-white/60 md:hidden'
                >
                  <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M3 6h18M3 12h18M3 18h18' />
                  </svg>
                </button>

                <Link href='/' className='flex items-center gap-2'>
                  <div className='relative h-8 w-28'>
                    <Image src='/images/logo.png' alt='HolaEcommerce' fill className='object-contain' sizes='120px' />
                  </div>
                  <div className='hidden sm:block text-[10px] tracking-[0.35em] text-gray-800 font-semibold'>HOLA ECOMMERCE</div>
                </Link>
              </div>

              {/* Right: search + icons (desktop) */}
              <div className='hidden md:flex items-center justify-end gap-4'>
                <div className='relative'>
                  <input
                    type='search'
                    placeholder='Search products…'
                    className='w-56 rounded-xl border border-black/10 bg-white/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/10'
                  />
                  <span className='pointer-events-none absolute right-2 top-2.5'>
                    <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                      <circle cx='11' cy='11' r='8' />
                      <path d='M21 21l-4.3-4.3' />
                    </svg>
                  </span>
                </div>

                <Link href='/cart' className='relative grid h-10 w-10 place-items-center rounded-xl ring-1 ring-black/10 hover:bg-black/5'>
                  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <circle cx='9' cy='21' r='1' />
                    <circle cx='20' cy='21' r='1' />
                    <path d='M1 1h4l2.68 12.39a2 2 0 0 0 2 1.61h7.72a2 2 0 0 0 2-1.61L22 6H6' />
                  </svg>
                  {cartCount > 0 && (
                    <span className='absolute -top-1 -right-1 rounded-full bg-pink-600 px-1.5 py-0.5 text-[10px] font-bold text-white'>
                      {cartCount}
                    </span>
                  )}
                </Link>

                <Link href='/login' className='grid h-10 w-10 place-items-center rounded-xl ring-1 ring-black/10 hover:bg-black/5'>
                  <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
                    <circle cx='12' cy='7' r='4' />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Desktop nav row — even spacing + same container width */}
            <nav
              className="hidden md:grid relative grid-cols-5 justify-items-center
                        border-t border-black/5 px-6 py-3 text-[13px] font-semibold uppercase
                        tracking-[0.25em] text-gray-900 max-w-[1440px] mx-auto"
            >
              <HeaderLink href="/">TRANG CHỦ</HeaderLink>
              <HeaderLink href="/catalog" mega>
                Danh Mục
                <MegaMenu />
              </HeaderLink>
              <HeaderLink href="/products">Cửa Hàng</HeaderLink>
              <HeaderLink href="/blog">Blog</HeaderLink>
              <HeaderLink href="/about">Về Chúng Tôi</HeaderLink>
            </nav>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile drawer giữ nguyên */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className='fixed inset-0 z-50 bg-black/40 backdrop-blur'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              role='dialog'
              aria-modal='true'
              className='fixed inset-y-0 left-0 z-50 w-[82%] max-w-xs bg-white shadow-xl'
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26 }}
            >
              <div className='flex items-center justify-between px-4 py-3 border-b'>
                <Link href='/' className='flex items-center gap-2' onClick={() => setOpen(false)}>
                  <div className='relative h-7 w-24'>
                    <Image src='/images/logo.png' alt='HolaEcommerce' fill className='object-contain' sizes='100px' />
                  </div>
                </Link>
                <button aria-label='Close menu' onClick={() => setOpen(false)} className='grid h-9 w-9 place-items-center rounded-lg ring-1 ring-black/10'>
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                    <path d='M18 6 6 18M6 6l12 12' />
                  </svg>
                </button>
              </div>
              <div className='px-4 py-4 space-y-3 text-[13px] font-semibold uppercase tracking-[0.25em] text-gray-900'>
                <MobileLink href='/' onClick={() => setOpen(false)}>TRANG CHỦ</MobileLink>
                <MobileLink href='/catalog' onClick={() => setOpen(false)}>Danh Mục</MobileLink>
                <MobileLink href='/products' onClick={() => setOpen(false)}>Cửa Hàng</MobileLink>
                <MobileLink href='/blog' onClick={() => setOpen(false)}>Blog</MobileLink>
                <MobileLink href='/about' onClick={() => setOpen(false)}>Về Chúng Tôi</MobileLink>
                <div className='my-2 border-t' />
                <MobileLink href='/faq' onClick={() => setOpen(false)}>Câu Hỏi Thường Gặp</MobileLink>
                <MobileLink href='/services' onClick={() => setOpen(false)}>Dịch Vụ</MobileLink>
                <MobileLink href='/contact' onClick={() => setOpen(false)}>Liên Hệ</MobileLink>
                <div className='my-2 border-t' />
                <MobileLink href='/cart' onClick={() => setOpen(false)}>Giỏ Hàng ({cartCount})</MobileLink>
                <MobileLink href='/login' onClick={() => setOpen(false)}>Đăng Nhập</MobileLink>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

/* ===== Helpers ===== */

function MobileLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg px-2 py-2 hover:bg-black/5 transition"
      onClick={onClick}
    >
      {children}
    </Link>
  );
}

function HeaderLink(
  { href, children, mega = false }:
  { href: string; children: React.ReactNode; mega?: boolean }
) {
  // child đầu tiên là label, các child sau (nếu có) là nội dung mega
  const items = React.Children.toArray(children)
  const label = items[0]
  const dropdown = items.slice(1)

  return (
    <div className="relative group w-full text-center">
      {/* Label */}
      <Link
        href={href}
        className="relative inline-block"
        aria-haspopup={mega ? 'true' : undefined}
        aria-expanded={undefined}
      >
        <span className="px-1.5 py-1">{label}</span>
        <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-gray-900
                         transition-all duration-300 group-hover:w-full" />
      </Link>

      {/* Dropdown (ẩn mặc định, hiện khi hover/focus vào ô Catalog) */}
      {mega && dropdown.length > 0 && (
        <div
          className="absolute left-1/2 top-full hidden -translate-x-1/2 pt-3 z-50
                     group-hover:block group-focus-within:block"
        >
          <div
            className="rounded-3xl border border-black/10 bg-white p-6 shadow-2xl
                       pointer-events-auto"
          >
            {dropdown /* ví dụ: <MegaMenu /> */}
          </div>
        </div>
      )}
    </div>
  )
}

function MegaMenu() {
  type Category = {
    id: number;
    name: string;
    slug: string;
    parentId: number | null;
    parentName: string | null;
  };

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetch('https://localhost:5000/categories')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCategories(data);
        } else {
          setCategories([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (!mounted) {
    // Render placeholder giống server để tránh hydration mismatch
    return (
      <div className="w-[720px] md:w-[760px] grid grid-cols-3 gap-6">
        {["Sneakers", "Apparel"].map((parent, idx) => (
          <div key={parent}>
            <h5 className="mb-2 text-xs font-bold tracking-widest text-gray-500 uppercase">{parent}</h5>
            <ul className="space-y-1.5 text-sm">
              <li><span className="text-gray-400">Đang tải...</span></li>
            </ul>
          </div>
        ))}
        <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/10 min-h-[180px]">
          <Image src="/images/Banner-03.jpg" alt="New Arrivals" fill className="object-cover" sizes="320px" priority={false} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="text-xs uppercase tracking-widest opacity-90">New Arrivals</div>
            <Link href="/products?tag=new-arrivals" className="mt-1 inline-flex items-center gap-2 text-sm font-semibold underline decoration-2 underline-offset-4">
              Shop now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Find all parent categories (parentId == null)
  const parentCategories = categories.filter(cat => cat.parentId === null);

  return (
    <div className="w-[720px] md:w-[760px] grid grid-cols-3 gap-6">
      {parentCategories.slice(0, 2).map((parent) => (
        <div key={parent.id}>
          <h5 className="mb-2 text-xs font-bold tracking-widest text-gray-500 uppercase">{parent.name}</h5>
          <ul className="space-y-1.5 text-sm">
            {loading ? (
              <li><span className="text-gray-400">Đang tải...</span></li>
            ) : (
              categories.filter(cat => cat.parentId === parent.id).length > 0 ? (
                categories.filter(cat => cat.parentId === parent.id).map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/catalog?cat=${cat.slug}`} className="block rounded-lg px-2 py-1.5 hover:bg-black/5 transition">{cat.name}</Link>
                  </li>
                ))
              ) : (
                <li><span className="text-gray-400">Không có dữ liệu</span></li>
              )
            )}
          </ul>
        </div>
      ))}
      {/* Col 3 – Promo card */}
      <div className="relative overflow-hidden rounded-2xl ring-1 ring-black/10 min-h-[180px]">
        <Image src="/images/Banner-03.jpg" alt="New Arrivals" fill className="object-cover" sizes="320px" priority={false} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="text-xs uppercase tracking-widest opacity-90">New Arrivals</div>
          <Link href="/products?tag=new-arrivals" className="mt-1 inline-flex items-center gap-2 text-sm font-semibold underline decoration-2 underline-offset-4">
            Shop now
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
