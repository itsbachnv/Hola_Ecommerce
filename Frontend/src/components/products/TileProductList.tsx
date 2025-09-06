// src/app/components/homepage/TileProductList.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

export const tileProducts = [
  {
    name: "Glossy Floor Tiles",
    brand: "Rainbow",
    price: 890,
    image: "/images/title-product-04.jpg",
    slug: "glossy-floor-tiles",
  },
  {
    name: "Vitrified Tiles",
    brand: "Tilex",
    price: 900,
    image: "/images/title-product-05.jpg",
    slug: "vitrified-tiles",
  },
  {
    name: "Polished Vitrified Tiles",
    brand: "Rainbow",
    price: 600,
    image: "/images/title-product-06.jpg",
    slug: "polished-vitrified-tiles",
  },
];

export default function TileProductList() {
  const prefersReduced = useReducedMotion();

  const container = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.08, duration: 0.4 },
    },
  };

  const item = {
    hidden: { opacity: 0, y: prefersReduced ? 0 : 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <section className="w-full px-4 md:px-16 lg:px-24 py-12">
      {/* Heading */}
      <div className="text-center mb-10">
        <p className="text-xs tracking-widest text-gray-500 uppercase">
          Bước tiếp theo để thay đổi phong cách
        </p>
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-[0.2em] text-black mt-2">
          FASHIONCARE
        </h2>
      </div>

      {/* Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8"
      >
        {tileProducts.map((p) => (
          <motion.article
            key={p.slug}
            variants={item}
            className="group relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/10 hover:ring-black/20 transition"
          >
            {/* Image */}
            <div className="relative aspect-square">
              <Image
                src={p.image}
                alt={p.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                sizes="(min-width: 768px) 33vw, 100vw"
                priority={false}
              />
              {/* vignette + badge */}
              <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.10)]" />
              <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest ring-1 ring-black/10">
                {p.brand}
              </span>

              {/* hover action */}
              <div className="absolute inset-x-3 bottom-3 translate-y-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <Link
                    href={`/products/${p.slug}`}
                    className="flex-1 rounded-full bg-black px-3 py-2 text-xs font-semibold text-white text-center hover:bg-black/90"
                  >
                    Xem chi tiết
                  </Link>
                  <button
                    className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold ring-1 ring-black/10 hover:bg-white"
                    onClick={() => {
                      // TODO: Thêm vào giỏ
                    }}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 text-center">
              <h3 className="text-base font-semibold text-gray-900 line-clamp-1">
                {p.name}
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Rs. {p.price.toFixed(2)}
              </p>

              {/* mobile CTA (hiện trên mobile vì hover khó) */}
              <div className="mt-4 sm:hidden">
                <Link
                  href={`/products/${p.slug}`}
                  className="w-full inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold hover:bg-gray-900 hover:text-white transition"
                >
                  Quick View
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
}
