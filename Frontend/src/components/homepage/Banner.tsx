'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'

// === Replace with your own slides ===
const slides = [
  {
    src: '/images/Banner-05.jpg',
    heading: 'Thể hiện phong cách của bạn',
    sub: 'Khám phá giày streetwear mới nhất',
    href: '/products',
    cta: 'Mua ngay',
  },
  {
    src: '/images/Banner-06.jpg',
    heading: 'Chinh phục đường phố',
    sub: 'Chuẩn drop. Chuẩn hàng ngày. Chuẩn cho bạn.',
    href: '/products?tag=new-arrivals',
    cta: 'Khám phá Drop',
  },
]

export default function GlamBanner() {
  const [index, setIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [mounted, setMounted] = useState(false);
  const prefersReduced = useReducedMotion()
  const progressRef = useRef<HTMLDivElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => (i + dir + slides.length) % slides.length)
    },
    []
  )

  const set = useCallback((i: number) => setIndex(((i % slides.length) + slides.length) % slides.length), [])

  // Auto-advance with pause-on-hover & tab visibility handling
  useEffect(() => {
    const start = () => {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(() => {
        if (!isHovering) go(1)
      }, 2000)
      // progress bar animation reset
      if (progressRef.current) {
        progressRef.current.style.animation = 'none'
        // force reflow
        // @ts-ignore
        progressRef.current.offsetHeight
        progressRef.current.style.animation = isHovering ? 'none' : 'progress 3.5s linear forwards'
      }
    }

    const onVisibility = () => {
      if (document.hidden) {
        if (timerRef.current) clearInterval(timerRef.current)
      } else start()
    }

    start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [go, isHovering])

  // Keyboard arrows & dots shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
      if (/^[1-9]$/.test(e.key)) set(Number(e.key) - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, set])

  const variants = useMemo(
    () => ({
      enter: (dir: number) => ({ x: prefersReduced ? 0 : dir > 0 ? 60 : -60, opacity: 0, scale: prefersReduced ? 1 : 0.975 }),
      center: { x: 0, opacity: 1, scale: 1, transition: { stiffness: 140, damping: 18 } },
      exit: (dir: number) => ({ x: prefersReduced ? 0 : dir > 0 ? -60 : 60, opacity: 0, scale: prefersReduced ? 1 : 0.985 }),
    }),
    [prefersReduced]
  )

  const dirRef = useRef(1)
  const handleSetIndex = (next: number) => {
    const dir = next > index || (index === slides.length - 1 && next === 0) ? 1 : -1
    dirRef.current = dir
    set(next)
  }

  // Touch/drag support via Framer Motion
  const swipeConfidence = 50 // px

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className='relative h-[70vh] md:h-[85vh] w-full overflow-hidden'
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      aria-roledescription='carousel'
      aria-label='Featured promotions'
    >
      {/* Background gradient glow */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -inset-24 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.20),transparent_60%)] mix-blend-overlay' />
        <div className='absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60' />
      </div>

      <AnimatePresence custom={dirRef.current} mode='popLayout'>
        {mounted ? (
          <motion.div
            key={index}
            custom={dirRef.current}
            variants={variants}
            initial='enter'
            animate='center'
            exit='exit'
            className='absolute inset-0'
            transition={{ duration: prefersReduced ? 0.2 : 0.6 }}
          >
            <Image
              src={slides[index].src}
              alt={slides[index].heading}
              fill
              priority
              className='object-cover'
              sizes='100vw'
            />

            {/* Foreground Content Card */}
            <div className='absolute inset-0 flex items-center justify-center p-4 md:p-8'>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                className='backdrop-blur-md bg-white/10 border border-white/15 shadow-2xl rounded-3xl px-6 py-8 md:px-10 md:py-12 max-w-3xl text-center text-white'
              >
                <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs tracking-wide uppercase mb-4 border border-white/20'>
                  <span className='h-2 w-2 rounded-full bg-white animate-pulse' />
                  New Season
                </div>
                <h1 className='text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-sm'>
                  {slides[index].heading}
                </h1>
                <p className='mt-3 md:mt-4 text-base md:text-lg text-white/90'>
                  {slides[index].sub}
                </p>
                <div className='mt-6 flex items-center justify-center gap-3'>
                  <Link
                    href={slides[index].href}
                    className='group relative inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-sm md:text-base text-white'
                  >
                    <span className='absolute inset-0 rounded-full bg-white/20 blur' />
                    <span className='relative rounded-full bg-black/80 px-6 py-3 ring-1 ring-white/20 backdrop-blur-md hover:bg-black transition'>
                      {slides[index].cta}
                    </span>
                  </Link>
                  <Link
                    href='/products?tag=all'
                    className='relative inline-flex items-center rounded-full px-6 py-3 text-sm md:text-base font-semibold text-white/90 ring-1 ring-white/30 hover:bg-white/10 transition'
                  >
                    Browse All
                  </Link>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <div className='absolute inset-0'>
            <Image
              src={slides[index].src}
              alt={slides[index].heading}
              fill
              priority
              className='object-cover'
              sizes='100vw'
            />
            {/* Foreground Content Card */}
            <div className='absolute inset-0 flex items-center justify-center p-4 md:p-8'>
              <div className='backdrop-blur-md bg-white/10 border border-white/15 shadow-2xl rounded-3xl px-6 py-8 md:px-10 md:py-12 max-w-3xl text-center text-white'>
                <div className='inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs tracking-wide uppercase mb-4 border border-white/20'>
                  <span className='h-2 w-2 rounded-full bg-white animate-pulse' />
                  New Season
                </div>
                <h1 className='text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-sm'>
                  {slides[index].heading}
                </h1>
                <p className='mt-3 md:mt-4 text-base md:text-lg text-white/90'>
                  {slides[index].sub}
                </p>
                <div className='mt-6 flex items-center justify-center gap-3'>
                  <Link
                    href={slides[index].href}
                    className='group relative inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold text-sm md:text-base text-white'
                  >
                    <span className='absolute inset-0 rounded-full bg-white/20 blur' />
                    <span className='relative rounded-full bg-black/80 px-6 py-3 ring-1 ring-white/20 backdrop-blur-md hover:bg-black transition'>
                      {slides[index].cta}
                    </span>
                  </Link>
                  <Link
                    href='/products?tag=all'
                    className='relative inline-flex items-center rounded-full px-6 py-3 text-sm md:text-base font-semibold text-white/90 ring-1 ring-white/30 hover:bg-white/10 transition'
                  >
                    Browse All
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className='pointer-events-none absolute inset-x-0 top-0 flex justify-between p-4 md:p-6'>
        <button
          aria-label='Previous slide'
          onClick={() => handleSetIndex((index - 1 + slides.length) % slides.length)}
          className='pointer-events-auto grid h-12 w-12 place-items-center rounded-full bg-black/40 ring-1 ring-white/30 backdrop-blur-sm hover:bg-black/60 transition'
        >
          <span className='sr-only'>Previous</span>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M15 18l-6-6 6-6' />
          </svg>
        </button>
        <button
          aria-label='Next slide'
          onClick={() => handleSetIndex((index + 1) % slides.length)}
          className='pointer-events-auto grid h-12 w-12 place-items-center rounded-full bg-black/40 ring-1 ring-white/30 backdrop-blur-sm hover:bg-black/60 transition'
        >
          <span className='sr-only'>Next</span>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            <path d='M9 18l6-6-6-6' />
          </svg>
        </button>
      </div>

      {/* Dots + progress bar */}
      <div className='absolute bottom-5 left-0 right-0 flex flex-col items-center gap-3 px-4'>
        <div ref={progressRef} className='h-1 w-48 overflow-hidden rounded-full bg-white/20'>
          <div className='h-full w-full origin-left scale-x-0 bg-white/80' />
        </div>
        <div className='flex items-center gap-2'>
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => handleSetIndex(i)}
              className={`group relative h-3 w-3 rounded-full transition ${
                i === index ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
              }`}
            >
              {i === index && (
                <span className='absolute -inset-2 rounded-full ring-2 ring-white/40' />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Thumbnail rail (optional on md+) */}
      <div className='pointer-events-auto hidden md:flex absolute bottom-6 right-6 gap-2 bg-black/30 p-2 rounded-2xl backdrop-blur-md ring-1 ring-white/20'>
        {slides.map((s, i) => (
          <button
            key={s.src}
            onClick={() => handleSetIndex(i)}
            className={`relative h-14 w-20 overflow-hidden rounded-xl ring-1 transition ${
              i === index ? 'ring-white' : 'ring-white/20 hover:ring-white/40'
            }`}
          >
            <Image src={s.src} alt='' fill className='object-cover' sizes='120px' />
            <span className='absolute inset-0 bg-black/30' />
          </button>
        ))}
      </div>

      {/* Drag layer for swipe on mobile */}
      <motion.div
        className='absolute inset-0'
        drag='x'
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.8}
        onDragEnd={(_, info) => {
          if (Math.abs(info.offset.x) > swipeConfidence) {
            handleSetIndex((index + (info.offset.x < 0 ? 1 : -1) + slides.length) % slides.length)
          }
        }}
      />

      {/* Local component styles */}
      <style jsx>{`
        @keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        div[ref] > div { transform-origin: left; }
      `}</style>
    </div>
  )
}
