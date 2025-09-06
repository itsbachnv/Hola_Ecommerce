// components/ProductCard.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

interface ProductCardProps {
  name: string;
  image: string;
  price: number;
  slug: string;
}

export const ProductCard = ({ name, image, price, slug }: ProductCardProps) => {
  return (
    <motion.article
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
    >
      <Link href={`/products/${slug}`} className="block">
        {/* Image wrapper */}
        <div className="relative h-64 w-full overflow-hidden">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 768px) 25vw, 100vw"
          />

          {/* hover actions */}
          <div className="absolute inset-x-3 bottom-3 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: Thêm vào giỏ
                }}
                className="flex-1 rounded-full bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-black/90"
              >
                Thêm vào giỏ
              </button>
              <span className="rounded-full bg-white/90 px-3 py-2 text-xs font-semibold border border-gray-200">
                Quick View
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 text-center">
          <h3 className="line-clamp-1 text-base font-semibold text-gray-900">
            {name}
          </h3>
          <p className="mt-1 text-pink-600 font-bold">${price}</p>
        </div>
      </Link>
    </motion.article>
  );
};
