'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'next/navigation'

export default function GlamRegister() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw1, setShowPw1] = useState(false)
  const [showPw2, setShowPw2] = useState(false)
  const [agree, setAgree] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const prefersReduced = useReducedMotion()
  
  const { register, isLoading } = useAuthStore()
  const router = useRouter()

  const strength = (() => {
    let s = 0
    if (password.length >= 8) s++
    if (/[A-Z]/.test(password)) s++
    if (/[0-9]/.test(password)) s++
    if (/[^A-Za-z0-9]/.test(password)) s++
    return s // 0..4
  })()

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setOk(null)
    
    // Validation
    if (!fullName.trim()) return setError('Please enter your full name.')
    const emailOk = /.+@.+\..+/.test(email)
    if (!emailOk) return setError('Please enter a valid email address.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')
    if (!agree) return setError('You must agree to the Terms & Privacy.')

    try {
      await register(fullName, email, password)
      setOk('Account created successfully! You can now log in.')
      // Reset form
      setFullName('')
      setEmail('')
      setPassword('')
      setConfirmPassword('')
      setAgree(true)
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed. Please try again.'
      setError(errorMessage)
    }
  }

  return (
    <div className='relative min-h-screen w-full' style={{ backgroundColor: '#fcfaf2' }}>
      {/* glow */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute -inset-x-32 top-0 h-56 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0.06),transparent_60%)]' />
      </div>

      <div className='mx-auto flex min-h-screen max-w-[1440px] flex-col md:flex-row items-stretch md:items-center gap-0 md:gap-10 px-4 md:px-16 lg:px-24 py-10'>
        {/* Left: Register Form */}
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='w-full md:w-1/2 flex items-center justify-center'
        >
          <div className='w-full max-w-md'>
            <h2 className='text-3xl md:text-4xl font-extrabold mb-8 text-center md:text-left'>Register</h2>

            <form onSubmit={onSubmit} className='space-y-4'>
              <label className='block'>
                <span className='sr-only'>Full name</span>
                <input
                  type='text'
                  autoComplete='name'
                  placeholder='Enter your full name *'
                  className='w-full rounded-full px-5 py-3 outline-none ring-1 ring-gray-300 focus:ring-gray-400 bg-white/80'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </label>
              
              <label className='block'>
                <span className='sr-only'>Email address</span>
                <input
                  type='email'
                  inputMode='email'
                  autoComplete='email'
                  placeholder='Enter your email address *'
                  className='w-full rounded-full px-5 py-3 outline-none ring-1 ring-gray-300 focus:ring-gray-400 bg-white/80'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>

              {/* Password */}
              <div className='relative'>
                <label className='block'>
                  <span className='sr-only'>Password</span>
                  <input
                    type={showPw1 ? 'text' : 'password'}
                    autoComplete='new-password'
                    placeholder='Password *'
                    className='w-full rounded-full px-5 py-3 outline-none ring-1 ring-gray-300 focus:ring-gray-400 pr-12 bg-white/80'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </label>
                <button
                  type='button'
                  onClick={() => setShowPw1((s) => !s)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800'
                  aria-label={showPw1 ? 'Hide password' : 'Show password'}
                >
                  {showPw1 ? '🙈' : '👁️'}
                </button>
                {/* strength meter */}
                <div className='mt-2 h-1.5 w-full rounded-full bg-white/60'>
                  <div
                    className={`h-full rounded-full ${
                      strength <= 1 ? 'bg-rose-400 w-1/4' : strength === 2 ? 'bg-amber-400 w-2/4' : strength === 3 ? 'bg-lime-500 w-3/4' : 'bg-emerald-500 w-full'
                    } transition-[width] duration-300`}
                  />
                </div>
                <p className='mt-1 text-xs text-gray-500'>Use 8+ chars with a mix of letters, numbers & symbols.</p>
              </div>

              {/* Confirm Password */}
              <div className='relative'>
                <label className='block'>
                  <span className='sr-only'>Confirm password</span>
                  <input
                    type={showPw2 ? 'text' : 'password'}
                    autoComplete='new-password'
                    placeholder='Confirm password *'
                    className='w-full rounded-full px-5 py-3 outline-none ring-1 ring-gray-300 focus:ring-gray-400 pr-12 bg-white/80'
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </label>
                <button
                  type='button'
                  onClick={() => setShowPw2((s) => !s)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800'
                  aria-label={showPw2 ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showPw2 ? '🙈' : '👁️'}
                </button>
              </div>

              {/* Terms */}
              <label className='flex items-center gap-2 text-sm text-gray-600'>
                <input type='checkbox' className='accent-black' checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                I agree to the <Link href='/terms' className='underline'>Terms</Link> & <Link href='/privacy' className='underline'>Privacy</Link>
              </label>

              {/* Alerts */}
              {error && <p className='text-sm text-rose-600'>{error}</p>}
              {ok && <p className='text-sm text-emerald-600'>{ok}</p>}

              {/* Submit */}
              <button
                type='submit'
                disabled={isLoading}
                className='w-full rounded-full bg-black py-3 font-semibold text-white transition hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed'
              >
                {isLoading ? 'Registering…' : 'Register'}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Right: Already have account */}
        <motion.div
          initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className='w-full md:w-1/2 bg-[#fafafa] flex items-center justify-center'
        >
          <div className='w-full max-w-md p-8 md:p-12 text-center md:text-left'>
            <h2 className='text-3xl md:text-4xl font-extrabold mb-4'>Have An Account</h2>
            <p className='text-gray-700 mb-6'>
              Welcome back, log in to your account to enhance your shopping experience, receive coupons, and the best discount codes.
            </p>
            <Link href='/login' className='inline-flex'>
              <button className='rounded-full bg-black px-6 py-2 font-semibold text-white hover:bg-black/90'>
                Login
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
