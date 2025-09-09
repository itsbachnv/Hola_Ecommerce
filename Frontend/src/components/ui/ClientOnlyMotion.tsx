'use client'

import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface ClientOnlyMotionProps {
  children: React.ReactNode
  className?: string
  delay?: number
}

export default function ClientOnlyMotion({ children, className, delay = 0 }: ClientOnlyMotionProps) {
  const [mounted, setMounted] = useState(false)
  const prefersReduced = useReducedMotion()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReduced ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReduced ? 0 : 0.5, delay: prefersReduced ? 0 : delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
