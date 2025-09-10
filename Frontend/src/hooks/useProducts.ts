import { useState, useEffect, useCallback } from 'react'
import { Product, ProductForm, ProductVariant } from '@/types'
import { useAuthStore } from '@/stores/auth'

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

// Helper function to get authenticated headers
function getAuthHeaders(): HeadersInit {
  const token = useAuthStore.getState().token
  console.log('🔑 Token from auth store:', token ? `${token.substring(0, 20)}...` : 'No token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
  
  console.log('📨 Request headers:', headers)
  return headers
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

      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result = await response.json()
      
      // Check if result is the expected format
      if (result && typeof result === 'object') {
        // Case 1: Standard ApiResponse format with success field
        if ('success' in result && result.success && result.data) {
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
            setProducts(result[arrayKey])
            setPagination({
              page: result.page || 1,
              pageSize: result.limit || result.pageSize || result[arrayKey].length,
              total: result.total || result[arrayKey].length,
              totalPages: result.totalPages || 1
            })
          } else {
            // If no array found, treat as single item
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
        throw new Error(`Invalid API response type: ${typeof result}`)
      }
    } catch (err) {
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

// Create Product function
export async function createProduct(productData: ProductForm): Promise<Product> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products`
    
    // Prepare data to match CreateProductCommand
    const requestData = {
      name: productData.name,
      slug: productData.slug || productData.name.toLowerCase().replace(/\s+/g, '-'),
      brandId: productData.brandId || null,
      categoryId: productData.categoryId || null,
      description: productData.description || null,
      status: productData.status || 'ACTIVE'
    }
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    // Extract the created product
    let createdProduct
    if (result.success && result.data) {
      createdProduct = result.data
    } else if (result.data) {
      createdProduct = result.data
    } else {
      createdProduct = result
    }
    
    // If we have variants in the form data, create them after product creation
    if (productData.variants && productData.variants.length > 0) {
      const variantsApiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/variants`
      
      // Delete the default variant first (if needed)
      // We'll update the default variant instead of creating new ones
      const defaultVariantId = createdProduct.variants?.[0]?.id
      
      for (let i = 0; i < productData.variants.length; i++) {
        const variant = productData.variants[i]
        
        if (i === 0 && defaultVariantId) {
          // Update the default variant with first variant data
          const updateVariantData = {
            id: defaultVariantId,
            sku: variant.sku || `SKU-${createdProduct.id}-${i + 1}`,
            name: variant.name || 'Default',
            price: variant.price || 0,
            compareAtPrice: variant.compareAtPrice || null,
            stockQty: variant.stockQty || 0,
            weightGrams: variant.weightGrams || null,
            attributes: variant.attributes || null
          }
          
          const updateResponse = await fetch(`${variantsApiUrl}/${defaultVariantId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updateVariantData)
          })
          
          if (!updateResponse.ok) {
            console.warn('Failed to update default variant:', updateResponse.status)
          }
        } else {
          // Create additional variants
          const createVariantData = {
            productId: createdProduct.id,
            sku: variant.sku || `SKU-${createdProduct.id}-${i + 1}`,
            name: variant.name || `Variant ${i + 1}`,
            price: variant.price || 0,
            compareAtPrice: variant.compareAtPrice || null,
            stockQty: variant.stockQty || 0,
            weightGrams: variant.weightGrams || null,
            attributes: variant.attributes || null
          }
          
          const createResponse = await fetch(variantsApiUrl, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(createVariantData)
          })
          
          if (!createResponse.ok) {
            console.warn('Failed to create variant:', createResponse.status)
          }
        }
      }
    }

    // If we have images in the form data, upload them after product creation
    if (productData.images && productData.images.length > 0) {
      const imagesToUpload: File[] = []
      
      for (const image of productData.images) {
        try {
          if (image.url.startsWith('blob:')) {
            // Convert blob URL to File
            const file = await blobUrlToFile(image.url, `product-${createdProduct.id}-${Date.now()}.jpg`)
            imagesToUpload.push(file)
          } else {
            // Handle existing image URLs (for edit cases)
            console.log('Image already exists:', image.url)
          }
        } catch (error) {
          console.warn('Failed to process image:', error)
        }
      }
      
      // Upload all new images
      if (imagesToUpload.length > 0) {
        try {
          const uploadedUrls = await uploadProductImages(createdProduct.id, imagesToUpload)
          console.log('Images uploaded successfully:', uploadedUrls)
        } catch (error) {
          console.warn('Failed to upload some images:', error)
        }
      }
    }
    
    return createdProduct
  } catch (error) {
    throw error
  }
}

// Update Product function
export async function updateProduct(id: string, productData: ProductForm): Promise<Product> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`
    
    // Prepare data to match UpdateProductCommand
    const requestData = {
      name: productData.name,
      slug: productData.slug || productData.name.toLowerCase().replace(/\s+/g, '-'),
      brandId: productData.brandId || null,
      categoryId: productData.categoryId || null,
      description: productData.description || null,
      status: productData.status || 'ACTIVE'
    }
    
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    // Handle different response formats
    if (result.success && result.data) {
      return result.data
    } else if (result.data) {
      return result.data
    } else {
      return result
    }
  } catch (error) {
    throw error
  }
}

// Delete Product function
export async function deleteProduct(id: string): Promise<void> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`
    
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
  } catch (error) {
    throw error
  }
}

// Create Variant function
export async function createVariant(variantData: {
  productId: number
  sku: string
  name?: string
  price: number
  compareAtPrice?: number
  stockQty: number
  weightGrams?: number
  attributes?: Record<string, unknown>
}): Promise<ProductVariant> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/variants`
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(variantData)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return result
  } catch (error) {
    throw error
  }
}

// Update Variant function
export async function updateVariant(id: string, variantData: {
  sku: string
  name?: string
  price: number
  compareAtPrice?: number
  stockQty: number
  weightGrams?: number
  attributes?: Record<string, unknown>
}): Promise<ProductVariant> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/variants/${id}`
    
    const requestData = {
      id: Number(id),
      ...variantData
    }
    
    const response = await fetch(apiUrl, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return result
  } catch (error) {
    throw error
  }
}

// Delete Variant function
export async function deleteVariant(id: string): Promise<void> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/variants/${id}`
    
    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
  } catch (error) {
    throw error
  }
}

// Helper function to get authenticated headers for FormData
function getAuthHeadersForFormData(): HeadersInit {
  const token = useAuthStore.getState().token
  return {
    ...(token && { 'Authorization': `Bearer ${token}` })
    // Don't set Content-Type for FormData, let browser set it
  }
}

// Upload Product Image function
export async function uploadProductImage(productId: number, file: File): Promise<string> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productId}/images`
    
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: getAuthHeadersForFormData(),
      body: formData
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    return result // Should return the image URL
  } catch (error) {
    throw error
  }
}

// Upload Multiple Product Images function
export async function uploadProductImages(productId: number, files: File[]): Promise<string[]> {
  const uploadPromises = files.map(file => uploadProductImage(productId, file))
  return Promise.all(uploadPromises)
}

// Convert blob URL to File (helper function)
export async function blobUrlToFile(blobUrl: string, fileName: string = 'image.jpg'): Promise<File> {
  const response = await fetch(blobUrl)
  const blob = await response.blob()
  return new File([blob], fileName, { type: blob.type })
}
