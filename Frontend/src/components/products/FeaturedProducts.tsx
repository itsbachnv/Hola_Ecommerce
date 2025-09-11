"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";
import { useProducts } from "@/hooks/useProducts";
import { Product } from "@/types";

export default function FeaturedProducts() {
  const router = useRouter();
  
  // Memoize filters to prevent infinite API calls
  const productFilters = useMemo(() => ({
    pageSize: 12, // Limit to show in featured section
    status: 'ACTIVE' // Only show active products
  }), []);
  
  // Use the real products API with filters for featured products
  const { products, loading, error } = useProducts(productFilters);

  // Prefetch product detail pages
  useEffect(() => {
    products.slice(0, 6).forEach((product: Product) => {
      router.prefetch?.(`/products/${product.slug}`);
    });
  }, [products, router]);

  const handleProductClick = (product: Product) => {
    // Use slug for SEO-friendly URLs
    router.push(`/products/${product.slug}`);
  };

  // Get the first 8 products for featured section
  const featuredProducts = useMemo(() => products.slice(0, 8), [products]);

  return (
    <section className="bg-transparent py-16 px-4 md:px-16 lg:px-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-[0.1em] text-black mt-2">Featured Products</h2>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl bg-white p-4 shadow-md border border-gray-200"
              >
                <div className="mb-4 h-56 w-full rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200 mb-2" />
                <div className="h-4 w-1/3 rounded bg-gray-200" />
                <div className="mt-4 h-9 w-full rounded-full bg-gray-200" />
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="text-center text-rose-600">{error}</div>
        )}

        {/* Slider */}
        {!loading && !error && featuredProducts.length > 0 && (
          <Swiper
            modules={[Navigation, Autoplay, A11y]}
            aria-label="Featured products carousel"
            spaceBetween={20}
            slidesPerView={1}
            navigation
            autoplay={{ delay: 2500, disableOnInteraction: false }}
            loop
            breakpoints={{
              640: { slidesPerView: 2 },
              768: { slidesPerView: 3 },
              1024: { slidesPerView: 4 },
            }}
          >
            {featuredProducts.map((product: Product) => (
              <SwiperSlide key={product.id}>
                <article
                  onClick={() => handleProductClick(product)}
                  className="group cursor-pointer h-full rounded-xl bg-white p-4 shadow-md border border-gray-200 transition hover:shadow-lg flex flex-col"
                >
                  <div className="relative mb-4 h-60 w-full overflow-hidden rounded">
                    {/* badge category */}
                    {product.categoryName && (
                      <span className="absolute left-2 top-2 z-10 rounded-full bg-black text-white px-2 py-1 text-[10px] font-semibold uppercase tracking-widest">
                        {product.categoryName}
                      </span>
                    )}
                    <Image
                      src={product.primaryImageUrl || '/images/placeholder-product.jpg'}
                      alt={product.name}
                      fill
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                    />
                  </div>

                  <div className="flex flex-col gap-3 flex-1">
                    <h3 className="line-clamp-2 text-left text-base font-semibold text-gray-800 min-h-[3.25rem]">
                      {product.name}
                    </h3>

                    {/* Brand name if available */}
                    {product.brandName && (
                      <div className="text-sm text-gray-500">
                        {product.brandName}
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex flex-col">
                        <p className="text-gray-900 font-semibold">
                          {product.minPrice?.toLocaleString('vi-VN')}₫
                          {product.maxPrice && product.maxPrice !== product.minPrice && (
                            <span className="text-gray-500"> - {product.maxPrice.toLocaleString('vi-VN')}₫</span>
                          )}
                        </p>
                        {product.compareAtPrice && (
                          <p className="text-sm text-gray-400 line-through">
                            {product.compareAtPrice.toLocaleString('vi-VN')}₫
                          </p>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Thêm vào giỏ
                        }}
                        className="rounded-full border border-black px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white bg-transparent"
                        aria-label={`Add ${product.name} to cart`}
                      >
                        Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}
