import { useState, useEffect, useCallback } from 'react'
import { Product } from '@/types'

interface ProductFilters {
  search?: string
  brandId?: string
  categoryId?: string
  status?: string
  page?: number
  pageSize?: number
}

interface ProductsResponse {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export function useProducts(filters: ProductFilters = {}) {
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 1
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Build URL properly like in useCategories
      let apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
      
      if (params.toString()) {
        apiUrl += `?${params.toString()}`
      }
      
      console.log('🛍️ Fetching products from:', apiUrl)
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('🛍️ Products response:', result)
      console.log('🛍️ Response type:', typeof result)
      console.log('🛍️ Response keys:', Object.keys(result || {}))
      
      // Check if result is the expected format
      if (result && typeof result === 'object') {
        // Case 1: Standard ApiResponse format with success field
        if ('success' in result && result.success && result.data) {
          console.log('✅ Format 1: ApiResponse with success')
          const data = Array.isArray(result.data.data) ? result.data.data : 
                      Array.isArray(result.data) ? result.data : []
          setProducts(data)
          setPagination({
            page: result.data.page || 1,
            pageSize: result.data.limit || result.data.pageSize || 20,
            total: result.data.total || data.length,
            totalPages: result.data.totalPages || 1
          })
        } 
        // Case 2: Direct array response
        else if (Array.isArray(result)) {
          console.log('✅ Format 2: Direct array')
          setProducts(result)
          setPagination({
            page: 1,
            pageSize: result.length,
            total: result.length,
            totalPages: 1
          })
        }
        // Case 3: Object with data array directly
        else if (result.data && Array.isArray(result.data)) {
          console.log('✅ Format 3: Object with data array')
          setProducts(result.data)
          setPagination({
            page: result.page || 1,
            pageSize: result.limit || result.pageSize || result.data.length,
            total: result.total || result.data.length,
            totalPages: result.totalPages || 1
          })
        }
        // Case 4: Object with products array
        else if (result.products && Array.isArray(result.products)) {
          console.log('✅ Format 4: Object with products array')
          setProducts(result.products)
          setPagination({
            page: result.page || 1,
            pageSize: result.limit || result.pageSize || result.products.length,
            total: result.total || result.products.length,
            totalPages: result.totalPages || 1
          })
        }
        // Case 5: Object with items array
        else if (result.items && Array.isArray(result.items)) {
          console.log('✅ Format 5: Object with items array')
          setProducts(result.items)
          setPagination({
            page: result.page || 1,
            pageSize: result.limit || result.pageSize || result.items.length,
            total: result.total || result.items.length,
            totalPages: result.totalPages || 1
          })
        }
        // Case 6: Try to find any array in the object
        else {
          const arrayKey = Object.keys(result).find(key => Array.isArray(result[key]))
          if (arrayKey) {
            console.log(`✅ Format 6: Found array at key "${arrayKey}"`)
            setProducts(result[arrayKey])
            setPagination({
              page: result.page || 1,
              pageSize: result.limit || result.pageSize || result[arrayKey].length,
              total: result.total || result[arrayKey].length,
              totalPages: result.totalPages || 1
            })
          } else {
            // If no array found, treat as single item
            console.log('✅ Format 7: Single item, wrapping in array')
            setProducts([result])
            setPagination({
              page: 1,
              pageSize: 1,
              total: 1,
              totalPages: 1
            })
          }
        }
      } else {
        console.error('❌ Invalid response type:', typeof result)
        throw new Error(`Invalid API response type: ${typeof result}`)
      }
    } catch (err) {
      console.error('🛍️ Error fetching products:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch products')
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Add debounce to prevent spam API calls
  useEffect(() => {
    // Only fetch if we have meaningful filters or it's initial load
    const shouldFetch = !filters.search || filters.search.length >= 2 || filters.categoryId || products.length === 0
    
    if (!shouldFetch) {
      return
    }

    const timeoutId = setTimeout(() => {
      fetchProducts()
    }, filters.search && filters.search.length > 0 ? 500 : 100) // Longer delay for search, shorter for other filters

    return () => clearTimeout(timeoutId)
  }, [fetchProducts, filters.search, filters.categoryId, products.length])

  return {
    products,
    pagination,
    loading,
    error,
    refetch: fetchProducts
  }
}
