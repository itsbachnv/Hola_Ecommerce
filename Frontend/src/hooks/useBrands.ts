import { useState, useEffect } from 'react'
import { Brand } from '@/types'

export function useBrands() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
        const response = await fetch(`${apiUrl}/brands`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        
        // Handle different response formats
        if (Array.isArray(data)) {
          setBrands(data)
        } else if (data.data && Array.isArray(data.data)) {
          setBrands(data.data)
        } else if (data.success && data.data && Array.isArray(data.data)) {
          setBrands(data.data)
        } else {
          setBrands([])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch brands')
        setBrands([])
      } finally {
        setLoading(false)
      }
    }

    fetchBrands()
  }, [])

  return { brands, loading, error }
}
