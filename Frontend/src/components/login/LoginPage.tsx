'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

export default function GlamLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prefersReduced = useReducedMotion()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Very basic validation for demo
    const emailOk = /.+@.+\..+/.test(email)
    if (!emailOk || password.length < 6) {
      setError(!emailOk ? 'Please enter a valid email address.' : 'Password must be at least 6 characters.')
      return
    }

    try {
      setLoading(true)
      // TODO: Replace with your auth request (NextAuth, custom API, etc.)
      await new Promise((r) => setTimeout(r, 900))
      // redirect...
    } catch (e) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='relative min-h-screen w-full bg-white'>
      {/* subtle background glow */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -inset-x-32 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_60%)]' />
      </div>

      <div className='mx-auto flex min-h-screen max-w-[1440px] flex-col md:flex-row items-stretch md:items-center gap-0 md:gap-10 px-4 md:px-16 lg:px-24 py-10'>
        {/* Left: Login card */}
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full md:w-1/2 flex items-center justify-center'
        >
          <div className='w-full max-w-md'>
            <h1 className='text-3xl md:text-4xl font-extrabold mb-8 text-center md:text-left'>Login</h1>

            <form onSubmit={onSubmit} className='space-y-4'>
              {/* Email */}
              <label className='block'>
                <span className='sr-only'>Email address</span>
                <input
                  type='email'
                  inputMode='email'
                  autoComplete='email'
                  placeholder='Enter your email address *'
                  className='w-full rounded-full bg-gray-100 px-5 py-3 outline-none ring-1 ring-transparent focus:ring-gray-300'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!error && !/.+@.+\..+/.test(email)}
                />
              </label>

              {/* Password */}
              <div className='relative'>
                <label className='block'>
                  <span className='sr-only'>Password</span>
                  <input
                    type={showPw ? 'text' : 'password'}
                    autoComplete='current-password'
                    placeholder='Password *'
                    className='w-full rounded-full bg-gray-100 px-5 py-3 outline-none ring-1 ring-transparent focus:ring-gray-300 pr-12'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-invalid={!!error && password.length < 6}
                  />
                </label>
                <button
                  type='button'
                  onClick={() => setShowPw((s) => !s)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800'
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Remember + forgot */}
              <div className='flex items-center justify-between text-sm text-gray-600'>
                <label className='inline-flex items-center gap-2'>
                  <input
                    type='checkbox'
                    className='accent-black'
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  Keep me signed in
                </label>
                <Link href='/forgot-password' className='font-medium hover:underline'>
                  Forgot your password?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <p className='text-sm text-rose-600'>{error}</p>
              )}

              {/* Submit */}
              <button
                type='submit'
                disabled={loading}
                className='w-full rounded-full bg-black py-3 font-semibold text-white transition hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {loading ? 'Logging in…' : 'Login'}
              </button>
            </form>

            {/* Social */}
            <div className='my-6 text-center text-sm text-gray-500'>
              <div className='flex items-center justify-center gap-2'>
                <hr className='w-1/4 border-gray-200' />
                Or continue with social account
                <hr className='w-1/4 border-gray-200' />
              </div>
            </div>

            <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center'>
              <button
                type='button'
                className='inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 ring-1 ring-gray-200 hover:bg-gray-50'
                aria-label='Sign in with Google'
              >
                <Image src='/icons/googleIcon.png' alt='' width={20} height={20} />
                Sign in with Google
              </button>
              <button
                type='button'
                className='inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3 ring-1 ring-gray-200 hover:bg-gray-50'
                aria-label='Sign in with Facebook'
              >
                <Image src='/icons/facebookIcon.webp' alt='' width={20} height={20} />
                Sign in with Facebook
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right: New Customer card */}
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className='w-full md:w-1/2 bg-[#fafafa] flex items-center justify-center'
        >
          <div className='w-full max-w-md p-8 md:p-12'>
            <h2 className='text-3xl md:text-4xl font-extrabold mb-4 text-center md:text-left'>New Customer</h2>
            <p className='text-gray-700 mb-8 text-center md:text-left'>
              For customers who register a new account, we are offering you a $50 shopping voucher and a 30% discount code. Happy shopping!
            </p>

            <h4 className='font-semibold mb-2'>Sign up and get your discount code</h4>

            <div className='rounded-2xl border bg-white p-6 shadow-sm ring-1 ring-gray-100'>
              <div className='flex justify-between text-sm text-gray-600 mb-3'>
                <span>Discount</span>
                <span className='font-bold text-gray-900'>30% OFF</span>
              </div>

              <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                <div>
                  <span className='block text-xs text-gray-600'>Code:</span>
                  <span className='text-lg font-semibold tracking-widest'>******* </span>
                </div>
                <Link href='/register' className='inline-flex'>
                  <button className='rounded-full bg-black px-6 py-2 font-semibold text-white hover:bg-black/90'>
                    Register
                  </button>
                </Link>
              </div>
              <p className='mt-2 text-right text-xs text-gray-400'>For all orders from $150</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
