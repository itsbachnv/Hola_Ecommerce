'use client'

import { FaTruck, FaUndo, FaShieldAlt, FaHeadset } from 'react-icons/fa'
import { motion } from 'framer-motion'

const features = [
  {
    icon: FaTruck,
    title: 'Giao hàng miễn phí',
    desc: 'Khi đặt hàng từ $500 trở lên',
  },
  {
    icon: FaUndo,
    title: 'Đổi/Hoàn trong 90 ngày',
    desc: 'Nếu sản phẩm gặp vấn đề',
  },
  {
    icon: FaShieldAlt,
    title: 'Thanh toán an toàn',
    desc: 'Bảo mật thanh toán 100%',
  },
  {
    icon: FaHeadset,
    title: 'Hỗ trợ 24/7',
    desc: 'Hỗ trợ tận tâm',
  },
]

export default function ServiceFeatures() {
  return (
    <section className="border-t border-gray-100 py-14" style={{ backgroundColor: 'transparent' }}>
      <div className="mx-auto max-w-[1440px] px-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 md:gap-8 text-center">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-200 hover:bg-gray-100 hover:shadow-lg transition"
              >
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white ring-1 ring-gray-200 text-gray-800 group-hover:bg-gray-900 group-hover:text-white transition">
                  <Icon className="text-xl" />
                </div>
                <h3 className="font-semibold text-gray-900">{f.title}</h3>
                <p className="mt-1 text-xs md:text-sm text-gray-500">
                  {f.desc}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
