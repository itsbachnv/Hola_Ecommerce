'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useMemo, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProducts } from '@/hooks/useProducts'
import { useBrands } from '@/hooks/useBrands'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { useLoadingStore } from '@/stores/loading'
import { Product } from '@/types'
import HeroSection_2 from '../homepage/HeroSection_2'

export default function GlamProductListPage() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null)
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null)
  const [maxPrice, setMaxPrice] = useState(10000000) // 10 triệu VNĐ
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)
  const perPage = 8

  // Cart and auth hooks
  const { addItem } = useCartStore()
  const { token, user } = useAuthStore()
  const { showToast } = useToastStore()
  const { setLoading, clearLoading } = useLoadingStore()

  // Fetch products từ API - không filter theo brand để tránh spam API
  const { products, loading: productsLoading, error: productsError } = useProducts({
    categoryId: selectedCategoryId?.toString(),
    // brandId: selectedBrandId?.toString(), // Comment out để tránh spam API
    status: 'ACTIVE'
  })

  // Fetch brands từ API
  const { brands: availableBrands, loading: brandsLoading } = useBrands()

  // Handle add to cart
  const handleAddToCart = async (product: Product) => {
    try {
      setLoading(true, 'Đang thêm sản phẩm vào giỏ hàng...', 'creating');
      
      // Get the first available variant
      const variant = product.variants?.[0];
      if (!variant) {
        showToast('Sản phẩm này chưa có biến thể có sẵn', 'error');
        return;
      }

      await addItem(product, variant, 1, token || undefined, user?.id);

      showToast('Đã thêm sản phẩm vào giỏ hàng!', 'success');
    } catch (error) {
      showToast('Có lỗi khi thêm sản phẩm vào giỏ hàng', 'error');
    } finally {
      clearLoading();
    }
  };

  // Tự động chọn brand đầu tiên khi brands load xong
  useEffect(() => {
    if (!brandsLoading && availableBrands.length > 0 && selectedBrandId === null) {
      setSelectedBrandId(availableBrands[0].id)
    }
  }, [availableBrands, brandsLoading, selectedBrandId])

  // Get unique brands from products for filter - REMOVED, using API brands instead
  // const availableBrands = useMemo(() => {
  //   const brands = products
  //     .filter(p => p.brand)
  //     .map(p => p.brand!)
  //     .filter((brand, index, self) => 
  //       index === self.findIndex(b => b.id === brand.id)
  //     )
  //   return brands
  // }, [products])

  // Client-side filtering and sorting (since API might not support all filters)
  const filtered = useMemo(() => {
    let arr = [...products]
    
    // Filter by price (using minPrice from variants)
    arr = arr.filter((p) => {
      const minPrice = p.minPrice || p.variants?.[0]?.price || 0
      return minPrice <= maxPrice
    })
    
    // Client-side category filter
    if (selectedCategoryId) {
      arr = arr.filter(p => p.categoryId === selectedCategoryId)
    }

    // Client-side brand filter
    if (selectedBrandId) {
      arr = arr.filter(p => p.brandId === selectedBrandId)
    }
    
    // Sort
    switch (sort) {
      case 'price-asc':
        arr = [...arr].sort((a, b) => {
          const priceA = a.minPrice || a.variants?.[0]?.price || 0
          const priceB = b.minPrice || b.variants?.[0]?.price || 0
          return priceA - priceB
        })
        break
      case 'price-desc':
        arr = [...arr].sort((a, b) => {
          const priceA = a.maxPrice || a.variants?.[0]?.price || 0
          const priceB = b.maxPrice || b.variants?.[0]?.price || 0
          return priceB - priceA
        })
        break
      case 'name':
        arr = [...arr].sort((a, b) => a.name.localeCompare(b.name))
        break
    }
    return arr
  }, [products, selectedCategoryId, selectedBrandId, maxPrice, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage))
  const pageSafe = Math.min(page, totalPages)
  const items = filtered.slice((pageSafe - 1) * perPage, pageSafe * perPage)
  const start = (pageSafe - 1) * perPage + 1
  const end = Math.min(pageSafe * perPage, filtered.length)

  return (
    <div className='mx-auto max-w-[1280px] px-4 md:px-10 lg:px-16 py-10'>
      {/* Title */}
      <HeroSection_2/>
      <div className='text-center mb-8'>
        <p className='text-xs uppercase tracking-widest text-gray-500'>Cửa hàng</p>
        <h1 className='text-2xl md:text-4xl font-extrabold'>Danh sách sản phẩm</h1>
      </div>

      <div className='flex flex-col lg:flex-row gap-8'>
        {/* Sidebar (đẹp + sticky + clear filters) */}
        <aside className='w-full lg:w-1/4 space-y-6 lg:sticky lg:top-24'>
          {/* Brand */}
          <div className='rounded-2xl ring-1 ring-gray-200 p-5 bg-white/60 hover:shadow-sm transition'>
            <h4 className='text-lg font-semibold mb-1'>Thương hiệu</h4>
            <p className='text-xs text-gray-500 mb-3'>Chọn thương hiệu để lọc</p>
            <ul className='flex flex-wrap gap-2'>
              {availableBrands.map((brand) => (
                <li key={brand.id}>
                  <button
                    onClick={() => {
                      setSelectedBrandId((current) => (current === brand.id ? null : brand.id))
                      setPage(1)
                    }}
                    className={`rounded-full border px-3 py-1 text-sm transition ${
                      selectedBrandId === brand.id
                        ? 'border-black bg-black text-white'
                        : 'border-gray-300 hover:border-black'
                    }`}
                  >
                    {brand.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Price */}
          <div className='rounded-2xl ring-1 ring-gray-200 p-5 bg-white/60 hover:shadow-sm transition'>
            <h4 className='text-lg font-semibold mb-1'>Giá</h4>
            <p className='text-xs text-gray-500 mb-3'>Kéo để đặt giá tối đa</p>
            <input
              type='range'
              min={0}
              max={10000000}
              step={100000}
              value={maxPrice}
              onChange={(e) => {
                setMaxPrice(Number(e.target.value))
                setPage(1)
              }}
              className='w-full'
            />
            <div className='mt-2 flex justify-between text-sm text-gray-600'>
              <span>0₫</span>
              <span className='font-semibold'>Tối đa {maxPrice.toLocaleString('vi-VN')}₫</span>
            </div>
            <button
              onClick={() => {
                setSelectedCategoryId(null)
                setSelectedBrandId(null)
                setMaxPrice(10000000)
                setSort('default')
                setPage(1)
              }}
              className='mt-3 w-full rounded-lg border px-3 py-2 text-sm hover:bg-gray-50'
            >
              Xóa bộ lọc
            </button>
          </div>

          {/* Size */}
          <div className='rounded-2xl ring-1 ring-gray-200 p-5 bg-white/60 hover:shadow-sm transition'>
            <h4 className='text-lg font-semibold mb-1'>Kích thước</h4>
            <p className='text-xs text-gray-500 mb-3'>Size phổ biến Việt Nam</p>
            <div className='flex flex-wrap gap-2 text-sm'>
              {['S', 'M', 'L', 'XL', 'XXL'].map((s) => (
                <span key={s} className='rounded-lg border px-2 py-1 text-gray-700'>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className='rounded-2xl ring-1 ring-gray-200 p-5 bg-white/60 hover:shadow-sm transition'>
            <h4 className='text-lg font-semibold mb-1'>Màu sắc</h4>
            <p className='text-xs text-gray-500 mb-3'>Bảng màu</p>
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
              {productsLoading ? (
                'Đang tải...'
              ) : productsError ? (
                'Lỗi tải dữ liệu'
              ) : (
                <>
                  Hiển thị{' '}
                  <span className='font-semibold text-gray-800'>{items.length > 0 ? start : 0}</span>
                  –
                  <span className='font-semibold text-gray-800'>{items.length > 0 ? end : 0}</span>
                  {' '}của <span className='font-semibold text-gray-800'>{filtered.length}</span> sản phẩm
                  {(selectedCategoryId || selectedBrandId) && (
                    <>
                      {' '}đã được lọc
                    </>
                  )}
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
              <option value='default'>Sắp xếp: Mặc định</option>
              <option value='price-asc'>Giá: Thấp đến cao</option>
              <option value='price-desc'>Giá: Cao đến thấp</option>
              <option value='name'>Tên: A → Z</option>
            </select>
          </div>

          {/* Grid (2x2 mỗi trang) */}
          <div className='grid grid-cols-2 md:grid-cols-2 gap-4 sm:gap-6'>
            {productsLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className='overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white animate-pulse'>
                  <div className='h-60 bg-gray-200'></div>
                  <div className='p-4'>
                    <div className='h-4 bg-gray-200 rounded mb-2'></div>
                    <div className='h-4 bg-gray-200 rounded w-1/2'></div>
                  </div>
                </div>
              ))
            ) : productsError ? (
              <div className='col-span-2 text-center py-8 text-gray-500'>
                Lỗi khi tải sản phẩm: {productsError}
              </div>
            ) : items.length === 0 ? (
              <div className='col-span-2 text-center py-8 text-gray-500'>
                Không tìm thấy sản phẩm nào
              </div>
            ) : (
              <AnimatePresence mode='popLayout'>
                {items.map((p) => (
                  <motion.article
                    key={`${p.id}-${pageSafe}`}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 16 }}
                    transition={{ duration: 0.25 }}
                    className='group overflow-hidden rounded-2xl ring-1 ring-gray-200 bg-white'
                  >
                    <div className='relative'>
                      <Link href={`/products/${p.slug}`}>
                        <div className='relative h-60 w-full overflow-hidden cursor-pointer'>
                          <Image
                            src={p.primaryImageUrl || p.images?.[0]?.url || '/images/placeholder-product.svg'}
                            alt={p.name}
                            fill
                            className='object-cover transition-transform duration-500 group-hover:scale-[1.04]'
                            sizes='(min-width: 768px) 50vw, 100vw'
                          />
                          <div className='pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.08)]' />
                          <div className='absolute left-2 top-2 rounded-full bg-black/80 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-white'>
                            {p.category?.name || 'Sản phẩm'}
                          </div>
                        </div>
                      </Link>

                      {/* hover actions */}
                      <div className='absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100'>
                        <div className='flex gap-2'>
                          <button 
                            onClick={() => handleAddToCart(p)}
                            className='flex-1 rounded-full bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-black/90 transition-colors'
                          >
                            Thêm vào giỏ
                          </button>
                          <Link 
                            href={`/products/${p.slug}`}
                            className='rounded-full bg-white/90 px-3 py-2 text-xs font-semibold ring-1 ring-gray-200 hover:bg-white transition-colors'
                          >
                            Xem nhanh
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className='p-4'>
                      <Link href={`/products/${p.slug}`}>
                        <h3 className='line-clamp-1 text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer'>{p.name}</h3>
                      </Link>
                      <p className='mt-1 text-pink-600 font-bold'>
                        {p.minPrice !== undefined && p.minPrice !== null ? (
                          p.minPrice === p.maxPrice ? 
                            `${p.minPrice.toLocaleString('vi-VN')}₫` : 
                            `${p.minPrice.toLocaleString('vi-VN')}₫ - ${(p.maxPrice || 0).toLocaleString('vi-VN')}₫`
                        ) : (
                          p.variants?.[0]?.price ? `${p.variants[0].price.toLocaleString('vi-VN')}₫` : 'Giá liên hệ'
                        )}
                      </p>
                    </div>
                  </motion.article>
                ))}
              </AnimatePresence>
            )}
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
