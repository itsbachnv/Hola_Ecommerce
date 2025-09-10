import { useState, useEffect, useCallback, useRef } from 'react'
import { Category } from '@/types'

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)

  const fetchCategories = useCallback(async () => {
    if (hasFetched.current) {
      return; // Chỉ fetch một lần duy nhất
    }
    
    try {
      setLoading(true)
      setError(null)
      hasFetched.current = true
    
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Handle different response formats
      let newCategories: Category[] = [];
      if (Array.isArray(result)) {
        newCategories = result;
      } else if (result && result.data && Array.isArray(result.data)) {
        newCategories = result.data;
      } else if (result && result.success && result.data && Array.isArray(result.data)) {
        newCategories = result.data;
      }
      
      setCategories(newCategories)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch categories';
      setError(errorMessage)
      setCategories([])
      hasFetched.current = false // Cho phép retry nếu có lỗi
    } finally {
      setLoading(false)
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: () => {
      hasFetched.current = false
      fetchCategories()
    }
  }
}
