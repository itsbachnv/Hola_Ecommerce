import { useState, useEffect } from 'react'
import { Category } from '@/types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError(null)
    
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Handle different response formats
      if (Array.isArray(result)) {
        setCategories(result)
      } else if (result && result.data && Array.isArray(result.data)) {
        setCategories(result.data)
      } else if (result && result.success && result.data && Array.isArray(result.data)) {
        setCategories(result.data)
      } else {
        setCategories([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch categories')
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  }
}
