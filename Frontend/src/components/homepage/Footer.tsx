'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'

export default function GlamFooter() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const valid = /.+@.+\..+/.test(email)
    if (!valid) return setStatus('error')
    // TODO: call your newsletter API here
    setStatus('ok')
    setEmail('')
    setTimeout(() => setStatus('idle'), 4000)
  }

  return (
    <footer className='relative mt-24 bg-black text-white'>
      {/* Glow & texture */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -inset-x-20 -top-40 h-[320px] bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.12),transparent_60%)]' />
      </div>

      {/* Newsletter strip */}
      <section className='border-b border-white/10'>
        <div className='mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-6 px-6 py-10 sm:grid-cols-5'>
          <div className='sm:col-span-2'>
            <h3 className='text-xl font-semibold'>Stay in the loop</h3>
            <p className='mt-1 text-sm text-white/70'>New drops, early access & exclusive codes—no spam.</p>
          </div>
          <form onSubmit={onSubmit} className='sm:col-span-3'>
            <div className='flex overflow-hidden rounded-2xl ring-1 ring-white/15 backdrop-blur supports-[backdrop-filter]:bg-white/5'>
              <input
                id='newsletter-email'
                name='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                aria-label='Email address'
                className='w-full bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none'
              />
              <button
                type='submit'
                className='group relative shrink-0 px-5 py-3 text-sm font-semibold'
                aria-label='Subscribe'
              >
                <span className='absolute inset-0 bg-white/10 group-hover:bg-white/15 transition' />
                <span className='relative'>Subscribe</span>
              </button>
            </div>
            <div className='mt-2 min-h-[1.5rem] text-xs'>
              {status === 'error' && <span className='text-rose-300'>Please enter a valid email.</span>}
              {status === 'ok' && <span className='text-emerald-300'>Subscribed! Check your inbox ✉️</span>}
              {status === 'idle' && <span className='text-white/50'>By subscribing, you agree to our <Link href='/privacy' className='underline'>Privacy Policy</Link>.</span>}
            </div>
          </form>
        </div>
      </section>

      {/* Main footer grid */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5 }}
        className='mx-auto grid max-w-[1440px] grid-cols-2 gap-10 px-6 py-14 sm:grid-cols-3 md:grid-cols-6'
      >
        {/* Brand */}
        <div className='col-span-2 md:col-span-2'>
          <div className='flex items-center gap-3'>
            <div className='grid h-10 w-10 place-items-center rounded-xl bg-white text-black font-black'>BK</div>
            <span className='text-lg font-semibold'>Bokx</span>
          </div>
          <p className='mt-3 max-w-sm text-sm leading-relaxed text-white/70'>
            Your go-to streetwear & sneaker hub. Designed in HCMC. Built for the culture.
          </p>
          <div className='mt-5 flex items-center gap-3 text-white/70'>
            <Social icon='tiktok' href='#' label='TikTok' />
            <Social icon='instagram' href='#' label='Instagram' />
            <Social icon='youtube' href='#' label='YouTube' />
            <Social icon='facebook' href='#' label='Facebook' />
            <Social icon='x' href='#' label='X' />
          </div>
        </div>

        {/* Shop */}
        <NavColumn title='Shop' links={[
          { label: 'Men', href: '#' },
          { label: 'Women', href: '#' },
          { label: 'Accessories', href: '#' },
          { label: 'Sale', href: '#' },
        ]} />

        {/* Help */}
        <NavColumn title='Help' links={[
          { label: 'Shipping', href: '#' },
          { label: 'Returns', href: '#' },
          { label: 'Order Tracking', href: '#' },
          { label: 'FAQ', href: '#' },
        ]} />

        {/* Company */}
        <NavColumn title='Company' links={[
          { label: 'About', href: '#' },
          { label: 'Careers', href: '#' },
          { label: 'Stores', href: '#' },
          { label: 'Press', href: '#' },
        ]} />

        {/* Contact */}
        <div>
          <h4 className='mb-4 text-sm font-semibold tracking-wide text-white'>Contact</h4>
          <ul className='space-y-2 text-sm text-white/70'>
            <li><span className='text-white/90'>Email:</span> support@bokx.co</li>
            <li><span className='text-white/90'>Phone:</span> +84 909 123 456</li>
            <li><span className='text-white/90'>Hours:</span> 09:00–21:00 (GMT+7)</li>
          </ul>
        </div>
      </motion.section>

      {/* Badges / payments */}
      <section className='border-t border-white/10'>
        <div className='mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-6 px-6 py-6 md:flex-row'>
          <div className='flex items-center gap-3 text-xs text-white/60'>
            <span className='rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-300 ring-1 ring-emerald-500/30'>
              Secure Checkout
            </span>
            <span className='rounded-full bg-indigo-500/20 px-2 py-1 text-indigo-300 ring-1 ring-indigo-500/30'>
              Fast Shipping
            </span>
            <span className='rounded-full bg-pink-500/20 px-2 py-1 text-pink-300 ring-1 ring-pink-500/30'>
              Easy Returns
            </span>
          </div>
          <div className='flex flex-wrap items-center gap-3 opacity-80'>
            {/* Replace src with your own icons under /public/icons */}
            {['visa','mastercard','vnpay','momo','cod'].map((p) => (
              <span key={p} className='inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10'>
                <Image src={`/icons/${p}.svg`} alt={p} width={28} height={18} />
                <span className='text-xs uppercase'>{p}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <div className='border-t border-white/10'>
        <div className='mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-6 py-6 text-sm text-white/60 md:flex-row'>
          <p>© {new Date().getFullYear()} Bokx. All rights reserved.</p>
          <div className='flex items-center gap-3'>
            <Select label='Region' items={['Vietnam (EN)', 'Vietnam (VI)']} />
            <Select label='Currency' items={['VND ₫', 'USD $']}/>
          </div>
        </div>
      </div>
    </footer>
  )
}

function NavColumn({ title, links }: { title: string, links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className='mb-4 text-sm font-semibold tracking-wide text-white'>{title}</h4>
      <ul className='space-y-2 text-sm'>
        {links.map((l) => (
          <li key={l.label}>
            <Link href={l.href} className='text-white/70 hover:text-white transition-colors'>
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Select({ label, items }: { label: string; items: string[] }) {
  return (
    <label className='inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 ring-1 ring-white/10'>
      <span className='text-xs text-white/60'>{label}</span>
      <select className='bg-transparent text-white text-sm outline-none'>
        {items.map((i) => (
          <option key={i} value={i} className='bg-black'>
            {i}
          </option>
        ))}
      </select>
    </label>
  )
}

function Social({ icon, href, label }: { icon: 'tiktok'|'instagram'|'youtube'|'facebook'|'x'; href: string; label: string }) {
  // Pure SVGs to avoid extra deps
  const paths: Record<string, JSX.Element> = {
    tiktok: (<path d='M14.5 2a6.5 6.5 0 0 0 6.5 6.5V12a10.5 10.5 0 0 1-6.5-2v6.25a5.75 5.75 0 1 1-5-5.69V8.5h3v7.75a2.75 2.75 0 1 0 2-2.63V2h0Z'/>),
    instagram: (<>
      <rect x='3' y='3' width='18' height='18' rx='5'/>
      <circle cx='12' cy='12' r='4'/>
      <circle cx='17.5' cy='6.5' r='1.2' />
    </>),
    youtube: (<>
      <path d='M22 12s0-3-0.38-4.5c-0.21-0.82-0.86-1.47-1.68-1.68C18.44 5.5 12 5.5 12 5.5s-6.44 0-7.94.32c-.82.21-1.47.86-1.68 1.68C2 9 2 12 2 12s0 3 .38 4.5c.21.82.86 1.47 1.68 1.68C5.56 18.5 12 18.5 12 18.5s6.44 0 7.94-.32c.82-.21 1.47-.86 1.68-1.68C22 15 22 12 22 12Z'/>
      <path d='M10 9.75 15 12l-5 2.25V9.75Z'/>
    </>),
    facebook: (<path d='M14 9h3V6h-3c-1.66 0-3 1.34-3 3v3H8v3h3v6h3v-6h3l1-3h-4V9c0-.55.45-1 1-1Z'/>),
    x: (<path d='M4 4l7.5 8.2L4.6 20H8l5-5.6L18.8 20H22l-8.2-9 6.6-7H17l-4.5 5L8.2 4H4Z'/>),
  }
  return (
    <Link href={href} aria-label={label} className='group grid h-10 w-10 place-items-center rounded-xl bg-white/5 ring-1 ring-white/10 hover:bg-white/10 hover:ring-white/20 transition'>
      <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor' className='text-white/80 group-hover:text-white'>
        {paths[icon]}
      </svg>
    </Link>
  )
}
