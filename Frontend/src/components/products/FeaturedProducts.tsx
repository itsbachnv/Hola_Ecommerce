"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, A11y } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import Image from "next/image";

interface Product {
  id: number;
  title: string;
  image: string;
  price: number;
  category?: string;
  rating?: { rate: number; count: number };
}

export default function FeaturedProducts() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current = new AbortController();
    const fetchDemoProducts = async () => {
      try {
        const res = await fetch("https://fakestoreapi.com/products", {
          signal: abortRef.current?.signal,
          // cache: "no-store", // uncomment nếu bạn muốn luôn gọi mới
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("Lỗi khi gọi API demo:", error);
          setErr("Không tải được danh sách sản phẩm. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDemoProducts();
    return () => abortRef.current?.abort();
  }, []);

  // Prefetch trang chi tiết khi slider xuất hiện
  useEffect(() => {
    products.slice(0, 6).forEach((p) => {
      router.prefetch?.(`/products/${p.id}`);
    });
  }, [products, router]);

  const handleProductClick = (id: number) => {
    router.push(`/products/${id}`);
  };

  const slides = useMemo(() => products, [products]);

  return (
    <section className="bg-gray-50 py-16 px-4 md:px-16 lg:px-24">
      <div className="mx-auto max-w-[1440px]">
        <div className="text-center mb-10">
          <p className="uppercase tracking-widest text-sm text-gray-500 mb-2">
            Demo
          </p>
          <h2 className="text-3xl font-semibold">Sản phẩm nổi bật</h2>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl bg-white p-4 ring-1 ring-gray-200"
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
        {!loading && err && (
          <div className="text-center text-rose-600">{err}</div>
        )}

        {/* Slider */}
        {!loading && !err && slides.length > 0 && (
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
            {slides.map((product) => (
              <SwiperSlide key={product.id}>
                <article
                  onClick={() => handleProductClick(product.id)}
                  className="group cursor-pointer h-full rounded-xl bg-white p-4 ring-1 ring-gray-200 transition hover:shadow-lg flex flex-col"
                >
                  <div className="relative mb-4 h-60 w-full overflow-hidden rounded">
                    {/* badge category (nếu có) */}
                    {product.category && (
                      <span className="absolute left-2 top-2 z-10 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest ring-1 ring-gray-200">
                        {product.category}
                      </span>
                    )}
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-contain p-2 transition-transform duration-500 group-hover:scale-[1.04]"
                      sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 100vw"
                    />
                  </div>

                  <div className="flex flex-col gap-3 flex-1">
                    <h3 className="line-clamp-2 text-left text-base font-semibold text-gray-800 min-h-[3.25rem]">
                      {product.title}
                    </h3>

                    {/* rating (nếu có) */}
                    {product.rating && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Stars value={product.rating.rate} />
                        <span>({product.rating.count})</span>
                      </div>
                    )}

                    <div className="mt-auto flex items-center justify-between">
                      <p className="text-gray-900 font-semibold">
                        ${product.price.toFixed(2)}
                      </p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Thêm vào giỏ
                        }}
                        className="rounded-full border border-gray-900 px-4 py-2 text-sm font-semibold transition hover:bg-gray-900 hover:text-white"
                        aria-label={`Add ${product.title} to cart`}
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

/* Helpers */
function Stars({ value = 0 }: { value?: number }) {
  // normalize 0..5
  const v = Math.max(0, Math.min(5, value));
  return (
    <div className="flex">
      {Array.from({ length: 5 }).map((_, i) => {
        const fill = i + 1 <= Math.floor(v);
        const half = !fill && i + 0.5 < v;
        return (
          <svg
            key={i}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="mr-0.5"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d="M12 17.3l-6.16 3.64 1.64-6.98L2 8.9l7.08-.6L12 1.8l2.92 6.5 7.08.6-5.48 5.06 1.64 6.98z"
              fill={
                fill ? "currentColor" : half ? `url(#half-${i})` : "none"
              }
              stroke="currentColor"
              className="text-amber-500"
              strokeWidth="1.5"
            />
          </svg>
        );
      })}
    </div>
  );
}
