'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function GlamHeroSection() {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className='relative w-full' style={{ backgroundColor: 'transparent' }}>
      {/* Glow background */}
      <div className='pointer-events-none absolute inset-0 -z-10'>
        <div className='absolute -inset-x-20 top-0 h-40 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.08),transparent_60%)]' />
      </div>

      <div className='mx-auto max-w-[1440px] px-4 md:px-10 lg:px-16 py-10 md:py-14'>
        {mounted ? (
          <motion.div
            initial={{ opacity: 0, y: prefersReduced ? 0 : 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5 }}
            className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch'
          >
            {/* Left Card */}
            <HeroCard
              src='/images/shoes-hero-3.jpg'
              alt='Minimal living interior'
              chip='Collection'
              heading='Minimal Living'
              sub='Soft tones. Clean lines. Cozy corners.'
              href='/products?tag=minimal-living'
              cta='Explore'
              direction='left'
            />

            {/* Right Card */}
            <HeroCard
              src='/images/shoes-hero-4.jpg'
              alt='Natural light interior'
              chip='New In'
              heading='Natural Light'
              sub='Breezy fabrics. Warm textures. Calm vibes.'
              href='/products?tag=natural-light'
              cta='Shop Now'
              direction='right'
            />
          </motion.div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch'>
            {/* Left Card */}
            <HeroCard
              src='/images/shoes-hero-3.jpg'
              alt='Minimal living interior'
              chip='Collection'
              heading='Minimal Living'
              sub='Soft tones. Clean lines. Cozy corners.'
              href='/products?tag=minimal-living'
              cta='Explore'
              direction='left'
            />

            {/* Right Card */}
            <HeroCard
              src='/images/shoes-hero-4.jpg'
              alt='Natural light interior'
              chip='New In'
              heading='Natural Light'
              sub='Breezy fabrics. Warm textures. Calm vibes.'
              href='/products?tag=natural-light'
              cta='Shop Now'
              direction='right'
            />
          </div>
        )}
      </div>

      {/* Local shine animation */}
      <style jsx>{`
        .shine:before {
          content: '';
          position: absolute;
          inset: -100% -50% auto -50%;
          height: 200%;
          transform: rotate(20deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.25), transparent);
          opacity: 0;
          transition: opacity .3s ease;
        }
        .group:hover .shine:before { opacity: .8; }
      `}</style>
    </section>
  )
}

function HeroCard({
  src,
  alt,
  chip,
  heading,
  sub,
  href,
  cta,
  direction = 'left',
}: {
  src: string
  alt: string
  chip: string
  heading: string
  sub: string
  href: string
  cta: string
  direction?: 'left' | 'right'
}) {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <article className='group relative isolate overflow-hidden rounded-3xl ring-1 ring-black/10 bg-white'>
        {/* Image */}
        <div className='relative aspect-[3/2] w-full'>
          <Image src={src} alt={alt} fill priority={false} className='object-cover transition-transform duration-700 group-hover:scale-[1.03]' sizes='(min-width: 768px) 50vw, 100vw' />
          <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent' />
          {/* subtle vignette */}
          <div className='absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.18)] pointer-events-none' />
        </div>

        {/* Content overlay */}
        <div className='pointer-events-none absolute inset-0 flex items-end p-5 md:p-7'>
          <div className='pointer-events-auto max-w-md text-white'>
            <span className='inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] tracking-widest uppercase ring-1 ring-white/25'>
              <span className='h-1.5 w-1.5 rounded-full bg-white animate-pulse' />
              {chip}
            </span>
            <h2 className='mt-2 text-2xl md:text-3xl font-extrabold drop-shadow-sm'>{heading}</h2>
            <p className='mt-1 text-sm md:text-base text-white/90'>{sub}</p>
            <a
              href={href}
              className='mt-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-white/90 hover:bg-white transition'
            >
              {cta}
              <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
                <path d='M5 12h14M13 5l7 7-7 7' />
              </svg>
            </a>
          </div>
        </div>

        {/* Shine */}
        <div className='shine absolute inset-0' />
      </article>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, x: prefersReduced ? 0 : direction === 'left' ? -24 : 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 0.6, type: 'spring', stiffness: 140, damping: 18 }}
      className='group relative isolate overflow-hidden rounded-3xl ring-1 ring-black/10 bg-white'
    >
      {/* Image */}
      <div className='relative aspect-[3/2] w-full'>
        <Image src={src} alt={alt} fill priority={false} className='object-cover transition-transform duration-700 group-hover:scale-[1.03]' sizes='(min-width: 768px) 50vw, 100vw' />
        <div className='absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent' />
        {/* subtle vignette */}
        <div className='absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.18)] pointer-events-none' />
      </div>

      {/* Content overlay */}
      <motion.div
        initial={{ y: 16, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.6 }}
        transition={{ delay: 0.1, duration: 0.45 }}
        className='pointer-events-none absolute inset-0 flex items-end p-5 md:p-7'
      >
        <div className='pointer-events-auto max-w-md text-white'>
          <span className='inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[10px] tracking-widest uppercase ring-1 ring-white/25'>
            <span className='h-1.5 w-1.5 rounded-full bg-white animate-pulse' />
            {chip}
          </span>
          <h2 className='mt-2 text-2xl md:text-3xl font-extrabold drop-shadow-sm'>{heading}</h2>
          <p className='mt-1 text-sm md:text-base text-white/90'>{sub}</p>
          <a
            href={href}
            className='mt-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-5 py-2.5 text-sm font-semibold text-gray-900 ring-1 ring-white/90 hover:bg-white transition'
          >
            {cta}
            <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
              <path d='M5 12h14M13 5l7 7-7 7' />
            </svg>
          </a>
        </div>
      </motion.div>

      {/* Shine */}
      <div className='shine absolute inset-0' />
    </motion.article>
  );
}
