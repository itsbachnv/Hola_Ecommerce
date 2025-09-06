'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const products = [
  { name: 'Nike Dunk Low', image: '/products/product-8.jpg', price: 150, slug: 'nike-dunk-low' },
  { name: 'Adidas Forum', image: '/products/product-22.jpg', price: 120, slug: 'adidas-forum' },
  { name: 'NB 550', image: '/products/product-24.jpg', price: 130, slug: 'nb-550' },
  { name: 'Yeezy Slide', image: '/products/product-28.jpg', price: 90, slug: 'yeezy-slide' },
  { name: 'Air Force 1', image: '/products/product-31.jpg', price: 110, slug: 'air-force-1' },
  { name: 'Jordan 1 Low', image: '/products/product-34.jpg', price: 160, slug: 'jordan-1-low' },
  { name: 'NB 550', image: '/products/product-38.jpg', price: 130, slug: 'nb-550' },
  { name: 'Yeezy Slide', image: '/products/product-42.jpg', price: 90, slug: 'yeezy-slide' },
  { name: 'Air Force 1', image: '/products/product-46.jpg', price: 110, slug: 'air-force-1' },
]

const brandCats = ['Nike', 'Adidas', 'New Balance', 'Jordan', 'Yeezy', 'Air Force'] as const

export default function GlamProductListPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [price, setPrice] = useState(200)
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)
  const perPage = 8

  const filtered = useMemo(() => {
    let arr = products.filter((p) => p.price <= price)
    if (selectedCategory) {
      const key = selectedCategory.toLowerCase()
      arr = arr.filter((p) => p.name.toLowerCase().includes(key) || p.slug.toLowerCase().includes(key))
    }
    switch (sort) {
      case 'price-asc':
        arr = [...arr].sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        arr = [...arr].sort((a, b) => b.price - a.price)
        break
      case 'name':
        arr = [...arr].sort((a, b) => a.name.localeCompare(b.name))
        break
    }
    return arr
  }, [selectedCategory, price, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageSafe = Math.min(page, totalPages)
  const items = filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage)
  const start = (pageSafe - 1) * perPage + 1
  const end = Math.min(pageSafe * perPage, filtered.length)

  return (
    <div className='mx-auto max-w-[1280px] px-4 md:px-10 lg:px-16 py-10'>
      {/* Title */}
      <div className='text-center mb-8'>
        <p className='text-xs uppercase tracking-widest text-gray-500'>Shop</p>
        <h1 className='text-2xl md:text-4xl font-extrabold'>Default Grid</h1>
      </div>

      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Sidebar (đẹp + sticky + clear filters) */}
        <aside className='w-full lg:w-1/4 space-y-6 lg:sticky lg:top-24'>
          {/* Brand */}
          <div className='rounded-2xl ring-1 ring-gray-200 p-5 bg-white/60 hover:shadow-sm transition'>
            <h4 className='text-lg font-semibold mb-1'>Brand</h4>
            <p className='text-xs text-gray-500 mb-3'>Pick a brand to filter</p>
            <ul className='flex flex-wrap gap-2'>
              {brandCats.map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      setSelectedCategory((c) => (c === cat ? null : cat))
                      setPage(1)
                    }}
                    className={`rounded-full border px-3 py-1 text-sm transition ${
                      selectedCategory === cat
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          <div className='rounded-2xl ring-1 ring-gray-200 p-5 bg-white/60 hover:shadow-sm transition'>
            <h4 className='text-lg font-semibold mb-1'>Price</h4>
            <p className='text-xs text-gray-500 mb-3'>Slide to set maximum</p>
            <input
              type='range'
              min={0}
              max={200}
              step={10}
              value={price}
              onChange={(e) => {
                setPrice(Number(e.target.value))
                setPage(1)
              }}
              className='w-full'
            />
            <div className='mt-2 flex justify-between text-sm text-gray-600'>
              <span>$0</span>
              <span className='font-semibold'>Up to ${price}</span>
            </div>
            <button
              onClick={() => {
                setSelectedCategory(null)
                setPrice(200)
                setSort('default')
                setPage(1)
              }}
              className='mt-3 w-full rounded-lg border px-3 py-2 text-sm hover:bg-gray-50'
            >
              Clear filters
            </button>
          </div>

          {/* Size */}
          <div className='rounded-2xl ring-1 ring-gray-200 p-5 bg-white/60 hover:shadow-sm transition'>
            <h4 className='text-lg font-semibold mb-1'>Size</h4>
            <p className='text-xs text-gray-500 mb-3'>Popular US sizes</p>
            <div className='flex flex-wrap gap-2 text-sm'>
              {['US 7', 'US 8', 'US 9', 'US 10', 'US 11'].map((s) => (
                <span key={s} className='rounded-lg border px-2 py-1 text-gray-700'>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className='rounded-2xl ring-1 ring-gray-200 p-5 bg-white/60 hover:shadow-sm transition'>
            <h4 className='text-lg font-semibold mb-1'>Color</h4>
            <p className='text-xs text-gray-500 mb-3'>Swatches</p>
            <div className='flex flex-wrap gap-2'>
              {['#111111', '#a0522d', '#556b2f', '#2f4f4f', '#c2b280'].map((c) => (
                <span key={c} className='h-6 w-6 rounded-full border' style={{ backgroundColor: c }} />
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className='w-full lg:w-3/4'>
          {/* Top bar */}
          <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='text-sm text-gray-500'>
              Showing{' '}
              <span className='font-semibold text-gray-800'>{items.length > 0 ? start : 0}</span>
              –
              <span className='font-semibold text-gray-800'>{items.length > 0 ? end : 0}</span>
              {' '}of <span className='font-semibold text-gray-800'>{filtered.length}</span> products
              {selectedCategory && (
                <>
                  {' '}in <span className='font-semibold text-gray-800'>{selectedCategory}</span>
                </>
              )}
            </div>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                setPage(1)
              }}
              className='w-full sm:w-auto rounded-lg border px-3 py-2 text-sm'
            >
              <option value='default'>Sort by: Default</option>
              <option value='price-asc'>Price: Low to High</option>
              <option value='price-desc'>Price: High to Low</option>
              <option value='name'>Name: A → Z</option>
            </select>
          </div>

          {/* Grid (2x2 mỗi trang) */}
          <div className='grid grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6'>
            <AnimatePresence mode='popLayout'>
              {items.map((p) => (
                <motion.article
                  key={p.image + p.name + pageSafe}
                  layout
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 16 }}
                  transition={{ duration: 0.25 }}
                  className='group overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white'
                >
                  <div className='relative'>
                    <div className='relative h-60 w-full overflow-hidden'>
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className='object-cover transition-transform duration-500 group-hover:scale-[1.04]'
                        sizes='(min-width: 768px) 50vw, 100vw'
                      />
                      <div className='pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.08)]' />
                      <div className='absolute left-2 top-2 rounded-full bg-black/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white'>
                        {p.slug.replaceAll('-', ' ')}
                      </div>
                    </div>

                    {/* hover actions */}
                    <div className='absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100'>
                      <div className='flex gap-2'>
                        <button className='flex-1 rounded-full bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-black/90'>Thêm vào giỏ</button>
                        <button className='rounded-full bg-white/90 px-3 py-2 text-xs font-semibold ring-1 ring-gray-200 hover:bg-white'>Quick View</button>
                      </div>
                    </div>
                  </div>
                  <div className='p-4'>
                    <h3 className='line-clamp-1 text-sm font-semibold text-gray-900'>{p.name}</h3>
                    <p className='mt-1 text-pink-600 font-bold'>${p.price}</p>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='mt-10 flex justify-center gap-2 text-sm'>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-9 w-9 rounded-full border transition hover:bg-pink-50 ${pageSafe === i + 1 ? 'bg-black text-white border-black' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
