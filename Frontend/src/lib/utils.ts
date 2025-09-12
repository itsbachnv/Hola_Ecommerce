import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

export function formatDate(date: string | Date): string {
  if (!date) return 'N/A'
  
  try {
    const dateObj = new Date(date)
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'Invalid Date'
    }
    
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj)
  } catch {
    return 'Invalid Date'
  }
}

// Generate a unique guest ID for unauthenticated users
export function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Get or create guest ID from localStorage
export function getGuestId(): string {
  if (typeof window === 'undefined') return generateGuestId()
  
  let guestId = localStorage.getItem('guestId')
  if (!guestId) {
    guestId = generateGuestId()
    localStorage.setItem('guestId', guestId)
  }
  return guestId
}
