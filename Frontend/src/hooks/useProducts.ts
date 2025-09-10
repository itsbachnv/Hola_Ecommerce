import { useState, useEffect, useCallback, useRef } from 'react'
import { Product, ProductForm, ProductVariant } from '@/types'
import { useAuthStore } from '@/stores/auth'
import toast from 'react-hot-toast'

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
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
  
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
  const hasInitialFetch = useRef(false)

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
        // Case 6: Object with numeric keys (API returns {0: product1, 1: product2})
        else if (Object.keys(result).every(key => !isNaN(Number(key)))) {
          const productsArray = Object.values(result) as Product[]
          setProducts(productsArray)
          setPagination({
            page: 1,
            pageSize: productsArray.length,
            total: productsArray.length,
            totalPages: 1
          })
        }
        // Case 6: Handle numeric keys {0: product, 1: product, ...}
        else if (Object.keys(result).every(key => !isNaN(Number(key)))) {
          const products = Object.values(result) as Product[]
          setProducts(products)
          setPagination({
            page: 1,
            pageSize: products.length,
            total: products.length,
            totalPages: 1
          })
        }
        // Case 7: Try to find any array in the object
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
    // Reset hasInitialFetch when filters change significantly
    if (filters.categoryId || filters.brandId) {
      hasInitialFetch.current = false
    }

    // Only fetch if we have meaningful filters or haven't fetched yet
    const shouldFetch = !hasInitialFetch.current || 
                       filters.categoryId || 
                       filters.brandId || 
                       (filters.search && filters.search.length >= 2)
    
    if (!shouldFetch) {
      return
    }

    const timeoutId = setTimeout(() => {
      fetchProducts()
      hasInitialFetch.current = true
    }, filters.search && filters.search.length > 0 ? 500 : 100)

    return () => clearTimeout(timeoutId)
  }, [fetchProducts, filters.search, filters.categoryId, filters.brandId])

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
      toast.error(`${errorData.detail}`)
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
        }
      }
    }

    // If we have images in the form data, upload them after product creation
    if (productData.images && productData.images.length > 0) {
      const imagesToUpload: File[] = []
      let primaryImageIndex = 0
      
      for (let i = 0; i < productData.images.length; i++) {
        const image = productData.images[i]
        try {
          if (image.url.startsWith('blob:')) {
            // Convert blob URL to File
            const file = await blobUrlToFile(image.url, `product-${createdProduct.id}-${Date.now()}-${i}.jpg`)
            imagesToUpload.push(file)
            
            // Track which file corresponds to the primary image
            if (image.isPrimary) {
              primaryImageIndex = imagesToUpload.length - 1
            }
          }
        } catch (error) {
        }
      }
      
      // Upload all new images in batch
      if (imagesToUpload.length > 0) {
        try {
          const uploadedUrls = await uploadProductImages(createdProduct.id, imagesToUpload, primaryImageIndex)
        } catch (error) {
          toast.error('Upload ảnh thất bại')
        }
      }
    }
    toast.success('Tạo sản phẩm thành công')
    return createdProduct
  } catch (error) {
    throw error
  }
}

// Update Product function (now supports variants and images)
export async function updateProduct(id: string, productData: ProductForm): Promise<Product> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${id}`
    
    // Prepare images data including deletions
    const allImagesData = []
    
    // Add existing images (some may be marked for deletion)
    if (productData.images) {
      const existingImages = productData.images.filter(img => !img.url.startsWith('blob:'))
      allImagesData.push(...existingImages.map(img => ({
        id: img.id,
        url: img.url,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder,
        isDeleted: false // These are not deleted since they're still in the images array
      })))
    }
    
    // Add images marked for deletion
    if (productData.imagesToDelete) {
      productData.imagesToDelete.forEach(imageId => {
        allImagesData.push({
          id: imageId,
          url: null, // URL not needed for deletion
          isPrimary: false,
          sortOrder: 0,
          isDeleted: true
        })
      })
    }
    
    // Prepare data to match UpdateProductCommand
    const requestData = {
      name: productData.name,
      slug: productData.slug || productData.name.toLowerCase().replace(/\s+/g, '-'),
      brandId: productData.brandId || null,
      categoryId: productData.categoryId || null,
      description: productData.description || null,
      status: productData.status || 'ACTIVE',
      variants: productData.variants?.map(v => ({
        id: v.id || null,
        sku: v.sku,
        name: v.name,
        price: v.price,
        compareAtPrice: v.compareAtPrice || null,
        stockQty: v.stockQty,
        weightGrams: v.weightGrams || null,
        isDeleted: false
      })) || null,
      images: allImagesData
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
    let updatedProduct: Product
    
    // Handle different response formats
    if (result.success && result.data) {
      updatedProduct = result.data
    } else if (result.data) {
      updatedProduct = result.data
    } else {
      updatedProduct = result
    }
    
    // Upload new images if any
    if (productData.newImageFiles && productData.newImageFiles.length > 0) {
      try {
        // Find primary index among new images
        const newImagePrimaryIndex = productData.images?.findIndex(img => 
          img.url.startsWith('blob:') && img.isPrimary
        ) ?? -1
        
        // Adjust index to be relative to new images only
        const newImagesPrimaryIndex = newImagePrimaryIndex >= 0 ? 
          productData.images!.slice(0, newImagePrimaryIndex)
            .filter(img => img.url.startsWith('blob:')).length : 0
        
        await uploadProductImages(updatedProduct.id, productData.newImageFiles, newImagesPrimaryIndex)
      } catch (error) {
      }
    }
    toast.success('Cập nhật sản phẩm thành công')
    return updatedProduct
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

    toast.success('Xóa sản phẩm thành công')
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
export async function uploadProductImage(productId: number, file: File, isPrimary: boolean = false): Promise<string> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productId}/images`
    
    const formData = new FormData()
    formData.append('file', file)
    formData.append('isPrimary', isPrimary.toString())
    
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
    toast.success('Upload ảnh thành công')
    return result // Should return the image URL
  } catch (error) {
    throw error
  }
}

// Upload Multiple Product Images function (optimized for batch upload)
export async function uploadProductImages(productId: number, files: File[], primaryIndex: number = 0): Promise<string[]> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productId}/images/batch`
    
    const formData = new FormData()
    
    // Add all files to FormData
    files.forEach((file) => {
      formData.append('files', file)
    })
    
    // Add sortOrders (theo thứ tự index)
    files.forEach((_, index) => {
      formData.append('sortOrders', index.toString())
    })
    
    // Add isPrimary flags (chỉ có 1 ảnh được đặt làm primary)
    files.forEach((_, index) => {
      formData.append('isPrimary', (index === primaryIndex).toString())
    })
    
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
    return result.urls || result // Should return array of image URLs
  } catch (error) {
    // Fallback to individual uploads if batch upload fails
    const uploadPromises = files.map((file, index) => 
      uploadProductImage(productId, file, index === primaryIndex)
    )
    return Promise.all(uploadPromises)
  }
}

// Convert blob URL to File (helper function)
export async function blobUrlToFile(blobUrl: string, fileName: string = 'image.jpg'): Promise<File> {
  const response = await fetch(blobUrl)
  const blob = await response.blob()
  return new File([blob], fileName, { type: blob.type })
}

// Delete Product Image function
export async function deleteProductImage(productId: number, imageUrl: string): Promise<void> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productId}/images?url=${encodeURIComponent(imageUrl)}`
    
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

// Set Primary Image function
export async function setPrimaryImage(productId: number, imageUrl: string): Promise<void> {
  try {
    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/${productId}/images/primary?url=${encodeURIComponent(imageUrl)}`
    
    const response = await fetch(apiUrl, {
      method: 'PATCH',
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
