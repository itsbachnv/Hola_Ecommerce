'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, useFieldArray, SubmitHandler, Controller } from 'react-hook-form'
import { Product, Category, Brand, ProductImage } from '@/types'
import type { ProductForm } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import VNDInput from '@/components/ui/VNDInput'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Button from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import { useProducts, createProduct, updateProduct, deleteProduct } from '@/hooks/useProducts'
import { useBrands } from '@/hooks/useBrands'
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  MoreHorizontal,
  Package,
  TrendingUp,
  AlertTriangle,
  Upload,
  X,
  ImagePlus
} from 'lucide-react'


export default function ProductManagement() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedParentCategory, setSelectedParentCategory] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch categories, products and brands using hooks (gọi 1 lần duy nhất)
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories()
  const { brands, loading: brandsLoading, error: brandsError } = useBrands()
  
  // Memoize filters to prevent unnecessary re-renders
  const productFilters = useMemo(() => ({
    search: searchQuery,
    categoryId: selectedCategory,
    page: 1,
    pageSize: 50
  }), [searchQuery, selectedCategory])
  
  const { products, pagination, loading: productsLoading, error: productsError, refetch } = useProducts(productFilters)

  // Product management functions
  const handleCreateProduct = async (productData: ProductForm) => {
    setIsSubmitting(true)
    try {
      await createProduct(productData)
      setIsCreateModalOpen(false)
      refetch() // Refresh the products list
    } catch (error) {

    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateProduct = async (id: string, productData: ProductForm) => {
    setIsSubmitting(true)
    try {
      await updateProduct(id, productData)
      setIsEditModalOpen(false)
      setSelectedProduct(null)
      refetch() // Refresh the products list
    } catch (error) {
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id)
      setIsDeleteModalOpen(false)
      setProductToDelete(null)
      refetch() // Refresh the products list
    } catch (error) {
    }
  }

  const openDeleteModal = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteModalOpen(true)
  }

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      // For now, we'll use update to toggle status
      const product = products.find(p => p.id === Number(id))
      if (product) {
        await updateProduct(id, {
          name: product.name,
          slug: product.slug,
          description: product.description,
          categoryId: product.categoryId,
          brandId: product.brandId,
          status: isActive ? 'ACTIVE' : 'INACTIVE'
        })
        refetch() // Refresh the products list
      }
    } catch (error) {
    }
  }

  // Separate parent and child categories
  const parentCategories = categories.filter(cat => cat.parentId === null || cat.parentId === undefined)
  const childCategories = categories.filter(cat => {
    // Handle both string and number types for parentId
    const selectedParentId = selectedParentCategory ? Number(selectedParentCategory) : null
    const categoryParentId = typeof cat.parentId === 'string' ? Number(cat.parentId) : cat.parentId
    return categoryParentId === selectedParentId
  })

  const filteredProducts = products // API already handles filtering, no need to filter again

  const stats = {
    total: products.length,
    active: products.filter(p => p.status === 'ACTIVE').length,
    outOfStock: products.filter(p => p.variants && Array.isArray(p.variants) && p.variants.every(v => v.stockQty === 0)).length,
    lowStock: products.filter(p => p.variants && Array.isArray(p.variants) && p.variants.some(v => v.stockQty > 0 && v.stockQty <= 10)).length
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button>
              Thêm sản phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tạo mới sản phẩm</DialogTitle>
            </DialogHeader>
            <ProductForm
              onSubmit={(data) => {
                handleCreateProduct(data)
              }}
              onCancel={() => setIsCreateModalOpen(false)}
              categories={categories}
              categoriesLoading={categoriesLoading}
              brands={brands}
              brandsLoading={brandsLoading}
              brandsError={brandsError}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Parent Category Filter */}
            <select
              value={selectedParentCategory}
              onChange={(e) => {
                setSelectedParentCategory(e.target.value)
                setSelectedCategory('') // Reset child category when parent changes
              }}
              className="px-3 py-2 border border-gray-300 rounded-md"
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading ? 'Loading...' : 'Tất cả danh mục chính'}
              </option>
              {parentCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Child Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
              disabled={categoriesLoading || !selectedParentCategory}
            >
              <option value="">
                {!selectedParentCategory 
                  ? 'Select parent first' 
                  : childCategories.length === 0 
                  ? 'No sub categories'
                  : 'All Sub Categories'
                }
              </option>
              {childCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Tổng sản phẩm ({filteredProducts.length})
            {productsLoading && <span className="text-sm text-gray-500 ml-2">Đang tải...</span>}
            {productsError && <span className="text-sm text-red-500 ml-2">Lỗi: {productsError}</span>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {productsLoading ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Đang tải sản phẩm...</h3>
            </div>
          ) : productsError ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Lỗi tải sản phẩm</h3>
              <p className="text-gray-600 mb-4">{productsError}</p>
              <Button onClick={() => window.location.reload()}>Thử lại</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              <thead>
                <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-gray-900 w-80">Sản phẩm</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 w-32">Danh mục</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 w-40">Khoảng giá bán</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 w-32">Giá gốc</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 w-24">Tồn kho</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 w-28">Trạng thái</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 w-32">Ngày tạo</th>
                <th className="text-left py-4 px-4 font-semibold text-gray-900 w-32">Hành động</th>
              </tr>

              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={() => {
                      setSelectedProduct(product)
                      setIsEditModalOpen(true)
                    }}
                    onDelete={() => openDeleteModal(product)}
                    onToggleStatus={(status) => handleToggleStatus(String(product.id), status)}
                  />
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
                <p className="text-gray-600">
                  {searchQuery || selectedCategory
                    ? 'Không có sản phẩm nào phù hợp với bộ lọc của bạn.'
                    : 'Bắt đầu bằng cách tạo sản phẩm đầu tiên của bạn.'}
                </p>
              </div>
            )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Sửa sản phẩm</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              product={selectedProduct}
              onSubmit={(data) => {
                handleUpdateProduct(String(selectedProduct.id), data)
              }}
              onCancel={() => {
                setIsEditModalOpen(false)
                setSelectedProduct(null)
              }}
              categories={categories}
              categoriesLoading={categoriesLoading}
              brands={brands}
              brandsLoading={brandsLoading}
              brandsError={brandsError}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa sản phẩm</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">
              Bạn có chắc chắn muốn xóa sản phẩm <strong>&quot;{productToDelete?.name}&quot;</strong> không?
            </p>
            <p className="text-sm text-red-600">
              ⚠️ Hành động này không thể hoàn tác và sẽ xóa tất cả dữ liệu liên quan đến sản phẩm.
            </p>
            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setProductToDelete(null)
                }}
              >
                Hủy
              </Button>
              <Button 
                type="button"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  if (productToDelete) {
                    handleDeleteProduct(String(productToDelete.id))
                  }
                }}
              >
                Xóa sản phẩm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProductRow({ 
  product, 
  onEdit, 
  onDelete, 
  onToggleStatus 
}: {
  product: Product
  onEdit: () => void
  onDelete: () => void
  onToggleStatus: (isActive: boolean) => void
}) {
  const [showActions, setShowActions] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  
  // Check if variants exist and is array, otherwise use defaults
  const variants = product.variants && Array.isArray(product.variants) ? product.variants : []
  const minPrice = variants.length > 0 ? Math.min(...variants.map(v => v.price)) : 0
  const maxPrice = variants.length > 0 ? Math.max(...variants.map(v => v.price)) : 0
  const compareAtPrices = variants.map(v => v.compareAtPrice || 0).filter(price => price > 0)
  const minCompareAtPrice = compareAtPrices.length > 0 ? Math.min(...compareAtPrices) : 0
  const maxCompareAtPrice = compareAtPrices.length > 0 ? Math.max(...compareAtPrices) : 0
  const totalStock = variants.reduce((sum, v) => sum + (v.stockQty || 0), 0)
  const isLowStock = totalStock > 0 && totalStock <= 10
  const isOutOfStock = totalStock === 0

  return (
    <>
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-4 px-4 align-top">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
               onClick={() => product.primaryImageUrl && setShowImageModal(true)}>
            {product.primaryImageUrl ? (
              <img
                src={product.primaryImageUrl}
                alt={product.name}
                className="w-12 h-12 object-cover"
              />
            ) : (
              <div className="w-12 h-12 flex items-center justify-center text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 pt-1">
            <p className="font-medium text-gray-900 truncate leading-5">{product.name}</p>
            <p className="text-sm text-gray-600 line-clamp-1 mt-1">{product.description}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 align-top">
        <span className="text-sm text-gray-600">{product.categoryName || "N/A"}</span>
      </td>
      <td className="py-4 px-4 align-top">
        <span className="text-sm font-medium">
          {minPrice === maxPrice 
            ? formatPrice(minPrice)
            : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
          }
        </span>
      </td>
      <td className="py-4 px-4 align-top">
        <span className="text-sm font-medium">
          {compareAtPrices.length > 0 ? (
            minCompareAtPrice === maxCompareAtPrice 
              ? formatPrice(minCompareAtPrice)
              : `${formatPrice(minCompareAtPrice)} - ${formatPrice(maxCompareAtPrice)}`
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
        </span>
      </td>
      <td className="py-4 px-4 align-top">
        <span className={`text-sm font-medium ${
          isOutOfStock ? 'text-red-600' : 
          isLowStock ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {totalStock}
        </span>
      </td>
      <td className="py-4 px-4 align-top">
        <button
          onClick={() => onToggleStatus(!product.status)}
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            product.status === 'ACTIVE'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {product.status === 'ACTIVE' ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="py-4 px-4 align-top">
        <span className="text-sm text-gray-600">
          {product.createdAt ? formatDate(product.createdAt) : 'N/A'}
        </span>
      </td>
      <td className="py-4 px-4 align-top">
        <div className="relative">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showActions && (
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-32">
              <button
                onClick={() => {
                  onEdit()
                  setShowActions(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => {
                  onDelete()
                  setShowActions(false)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>

    {/* Image Modal */}
    {showImageModal && product.primaryImageUrl && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        onClick={() => setShowImageModal(false)}
      >
        <div className="max-w-4xl max-h-[90vh] p-4">
          <img
            src={product.primaryImageUrl}
            alt={product.name}
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="text-white text-center mt-4">
            <h3 className="text-lg font-medium">{product.name}</h3>
            <p className="text-sm opacity-75">Click outside to close</p>
          </div>
        </div>
      </div>
    )}
    </>
  )
}

function ProductForm({ 
  product, 
  onSubmit, 
  onCancel,
  categories,
  categoriesLoading,
  brands,
  brandsLoading,
  brandsError,
  isSubmitting = false
}: {
  product?: Product
  onSubmit: SubmitHandler<ProductForm>
  onCancel: () => void
  categories: Category[]
  categoriesLoading: boolean
  brands: Brand[]
  brandsLoading: boolean
  brandsError: string | null
  isSubmitting?: boolean
}) {
  const [selectedParentCategory, setSelectedParentCategory] = useState('')
  const [selectedChildCategory, setSelectedChildCategory] = useState('')
  const [productImages, setProductImages] = useState<string[]>([])
  // Remove unused imageFiles since we now use productImages array
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0) // Track which image is primary
  const [isUploadingImages, setIsUploadingImages] = useState(false)

  // Separate parent and child categories
  const parentCategories = categories.filter(cat => cat.parentId === null || cat.parentId === undefined)
  const childCategories = categories.filter(cat => {
    // Handle both string and number types for parentId
    const selectedParentId = selectedParentCategory ? Number(selectedParentCategory) : null
    const categoryParentId = typeof cat.parentId === 'string' ? Number(cat.parentId) : cat.parentId
    return categoryParentId === selectedParentId
  })
  
  const { register, handleSubmit, formState: { errors }, setValue, control, watch } = useForm<ProductForm>({
    defaultValues: product ? {
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: product.categoryId,
      brandId: product.brandId,
      attributes: product.attributes || {},
      status: product.status,
      variants: product.variants?.map(v => ({
        id: v.id,
        sku: v.sku,
        name: v.name,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        stockQty: v.stockQty,
        weightGrams: v.weightGrams,
        attributes: v.attributes || {}
      })) || []
    } : {
      name: '',
      slug: '',
      description: '',
      categoryId: undefined,
      brandId: undefined,
      attributes: {},
      status: 'ACTIVE',
      variants: [{
        sku: '',
        name: 'Default',
        price: 0,
        compareAtPrice: 0,
        stockQty: 0,
        weightGrams: 0,
        attributes: {}
      }]
    }
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants'
  })

  // Set initial images and categories when editing
  useEffect(() => {
    if (product) {
      // Store the original existing images
      setExistingImages(product.images || [])
      
      // Convert ProductImage[] to string[] for display
      const imageUrls = product.images?.map(img => img.url) || []
      setProductImages(imageUrls)
      
      // Clear any previous new image files and deletion tracking
      setNewImageFiles([])
      setImagesToDelete([])
      
      // Set basic product fields
      setValue('name', product.name || '')
      setValue('description', product.description || '')
      
      // Find and set primary image index
      const primaryIndex = product.images?.findIndex(img => img.isPrimary) || 0
      setPrimaryImageIndex(primaryIndex >= 0 ? primaryIndex : 0)
      
      // Set brandId in form
      if (product.brandId) {
        setValue('brandId', product.brandId)
      }

      // Set variants data in form
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach((variant, index) => {
          setValue(`variants.${index}.name`, variant.name || 'Default')
          setValue(`variants.${index}.sku`, variant.sku || '')
          setValue(`variants.${index}.price`, variant.price || 0)
          setValue(`variants.${index}.compareAtPrice`, variant.compareAtPrice || 0)
          setValue(`variants.${index}.stockQty`, variant.stockQty || 0)
          setValue(`variants.${index}.weightGrams`, variant.weightGrams || 0)
          
          // Extract color and size from attributes
          if (variant.attributes) {
            let attrs: Record<string, unknown> = {}
            try {
              // Parse attributes if it's a string
              attrs = typeof variant.attributes === 'string' 
                ? JSON.parse(variant.attributes) 
                : variant.attributes
            } catch {
              attrs = {}
            }
            
            // Set individual color and size fields
            setValue(`variants.${index}.color`, attrs.color as string || '')
            setValue(`variants.${index}.size`, attrs.size as string || '')
          } else {
            setValue(`variants.${index}.color`, '')
            setValue(`variants.${index}.size`, '')
          }
        })
      }
      
      if (categories.length > 0) {
        const productCategoryId = String(product.categoryId)
        const currentCategory = categories.find(cat => String(cat.id) === productCategoryId)
        
        if (currentCategory) {
          if (currentCategory.parentId) {
            setSelectedParentCategory(String(currentCategory.parentId))
            setSelectedChildCategory(String(currentCategory.id))
          } else {
            setSelectedParentCategory(String(currentCategory.id))
            setSelectedChildCategory('')
          }
        }
      }
    } else {
      // Reset form when product is null (for create mode)
      setExistingImages([])
      setProductImages([])
      setNewImageFiles([])
      setImagesToDelete([])
      setPrimaryImageIndex(0)
      setSelectedParentCategory('')
      setSelectedChildCategory('')
      
      // Reset form values
      setValue('name', '')
      setValue('description', '')
      setValue('brandId', 0)
      setValue('categoryId', 0)
      // Reset variants array to have at least one default variant
      setValue('variants', [{
        name: 'Default',
        sku: '',
        price: 0,
        compareAtPrice: 0,
        stockQty: 0,
        weightGrams: 0,
        color: '',
        size: ''
      }])
    }
  }, [product, categories, setValue])

  // Store File objects for tracking new uploads
  const [newImageFiles, setNewImageFiles] = useState<File[]>([])
  const [imagesToDelete, setImagesToDelete] = useState<number[]>([]) // Track existing image IDs to delete
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]) // Track original existing images

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setIsUploadingImages(true)
      try {
        const filesArray = Array.from(files)
        // Create blob URLs for preview
        const newImages = filesArray.map(file => URL.createObjectURL(file))
        
        // Store both blob URLs for preview and file objects for upload
        setProductImages(prev => [...prev, ...newImages])
        setNewImageFiles(prev => [...prev, ...filesArray])
      } finally {
        setIsUploadingImages(false)
      }
    }
  }

  const removeImage = (index: number) => {
    const imageToRemove = productImages[index]
    
    // Check if this is an existing image or a new image
    if (imageToRemove.startsWith('blob:')) {
      // This is a new image (blob URL), remove from newImageFiles
      const blobIndex = productImages.slice(0, index).filter(img => img.startsWith('blob:')).length
      setNewImageFiles(prev => prev.filter((_, i) => i !== blobIndex))
    } else {
      // This is an existing image, add its ID to deletion list
      const existingImage = existingImages.find(img => img.url === imageToRemove)
      if (existingImage) {
        setImagesToDelete(prev => [...prev, existingImage.id])
      }
    }
    
    // Remove from display array
    setProductImages(prev => prev.filter((_, i) => i !== index))
    
    // Update primary image index if needed
    if (index === primaryImageIndex) {
      // If we're removing the primary image, set the first remaining image as primary
      setPrimaryImageIndex(0)
    } else if (index < primaryImageIndex) {
      // If we're removing an image before the primary image, adjust the index
      setPrimaryImageIndex(prev => prev - 1)
    }
    // If index > primaryImageIndex, no need to change primaryImageIndex
  }

  const addVariant = () => {
    appendVariant({
      sku: '',
      name: '',
      price: 0,
      compareAtPrice: 0,
      stockQty: 0,
      weightGrams: 0,
      color: '',
      size: '',
      attributes: {}
    })
  }

  const handleFormSubmit = (data: ProductForm) => {
    // Transform variants: combine color/size into attributes JSON
    const transformedVariants = data.variants?.map(variant => {
      // Build attributes object from color and size
      const attributes: Record<string, unknown> = {}
      
      if (variant.color?.trim()) {
        attributes.color = variant.color.trim()
      }
      
      if (variant.size?.trim()) {
        attributes.size = variant.size.trim()
      }
      
      return {
        ...variant,
        attributes: Object.keys(attributes).length > 0 ? attributes : {}
      }
    }) || []

    // Send complete product data including variants for proper creation/update
    const formData: ProductForm = {
      name: data.name,
      slug: data.slug || data.name.toLowerCase().replace(/\s+/g, '-'),
      brandId: data.brandId || undefined,
      categoryId: data.categoryId || undefined,
      description: data.description || undefined,
      status: data.status || 'ACTIVE',
      variants: transformedVariants, // Use transformed variants
      images: buildImagesData(),
      newImageFiles: newImageFiles, // Send new files separately
      imagesToDelete: imagesToDelete // Send IDs of images to delete
    }
    onSubmit(formData)
  }

  const buildImagesData = () => {
    const images: ProductImage[] = []
    
    // Add existing images that are still in the display (not deleted)
    existingImages.forEach((img) => {
      // Only include if it's still in productImages and not marked for deletion
      if (productImages.includes(img.url) && !imagesToDelete.includes(img.id)) {
        const currentIndex = productImages.indexOf(img.url)
        images.push({
          id: img.id,
          productId: img.productId,
          url: img.url,
          isPrimary: currentIndex === primaryImageIndex,
          sortOrder: currentIndex,
          createdAt: img.createdAt
        })
      }
    })
    
    // Add new images (blob URLs) - these will be handled by the upload process
    const blobUrls = productImages.filter(url => url.startsWith('blob:'))
    blobUrls.forEach((imageUrl) => {
      const actualIndex = productImages.indexOf(imageUrl)
      images.push({
        id: 0, // New images have ID 0
        productId: product?.id || 0,
        url: imageUrl, // This will be replaced after upload
        isPrimary: actualIndex === primaryImageIndex,
        sortOrder: actualIndex,
        createdAt: new Date().toISOString()
      })
    })
    
    return images
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit(handleFormSubmit)} className={`space-y-6 ${(isSubmitting || isUploadingImages) ? 'pointer-events-none opacity-75' : ''}`}>
        {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Thông tin cơ bản</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm *
            </label>
            <Input
              {...register('name', { required: 'Tên sản phẩm là bắt buộc' })}
              placeholder="Nhập tên sản phẩm"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục cha *
            </label>
            <select
              value={selectedParentCategory}
              onChange={(e) => {
                setSelectedParentCategory(e.target.value)
                setSelectedChildCategory('')
                setValue('categoryId', 0)
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading ? 'Đang tải...' : 'Chọn danh mục cha'}
              </option>
              {parentCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục con *
            </label>
            <select
              {...register('categoryId', { required: 'Danh mục là bắt buộc' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              disabled={categoriesLoading || !selectedParentCategory}
              value={selectedChildCategory}
              onChange={(e) => {
                setSelectedChildCategory(e.target.value)
                setValue('categoryId', Number(e.target.value))
              }}
            >
              <option value="">
                {!selectedParentCategory 
                  ? 'Chọn danh mục cha trước' 
                  : childCategories.length === 0 
                  ? 'Không có danh mục con'
                  : 'Chọn danh mục con'
                }
              </option>
              {childCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-600 text-sm mt-1">{errors.categoryId.message}</p>
            )}
          </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Thương hiệu
          </label>
          <select
            {...register('brandId')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            disabled={brandsLoading}
            defaultValue={product?.brandId || ''}
          >
            <option value="">
              {brandsLoading ? 'Đang tải thương hiệu...' : 'Chọn thương hiệu (tùy chọn)'}
            </option>
            {brands.map(brand => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>
          {brandsError && (
            <p className="text-red-600 text-sm mt-1">Lỗi tải thương hiệu: {brandsError}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Slug
        </label>
        <Input
          {...register('slug')}
          placeholder="product-slug (tự động tạo từ tên nếu để trống)"
        />
      </div>        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả chi tiết *
          </label>
          <textarea
            {...register('description', { required: 'Mô tả là bắt buộc' })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Nhập mô tả chi tiết sản phẩm"
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trạng thái *
            </label>
            <select
              {...register('status', { required: 'Trạng thái là bắt buộc' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="ACTIVE">Hoạt động</option>
              <option value="INACTIVE">Không hoạt động</option>
              <option value="DRAFT">Bản nháp</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Hình ảnh sản phẩm</h3>
        <p className="text-sm text-gray-600">Ảnh đầu tiên sẽ được đặt làm ảnh chính. Bạn có thể thay đổi bằng cách bấm nút &quot;Đặt làm ảnh chính&quot;.</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {productImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Product image ${index + 1}`}
                className={`w-full h-32 object-cover rounded-lg border-2 ${
                  index === primaryImageIndex 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-200'
                }`}
              />
              
              {/* Primary image badge */}
              {index === primaryImageIndex && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Ảnh chính
                </div>
              )}
              
              {/* Action buttons */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                {index !== primaryImageIndex && (
                  <button
                    type="button"
                    onClick={() => setPrimaryImageIndex(index)}
                    className="bg-blue-500 text-white text-xs px-2 py-1 rounded hover:bg-blue-600"
                    title="Đặt làm ảnh chính"
                  >
                    Đặt làm ảnh chính
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  title="Xóa ảnh"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          
          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 ${
            isUploadingImages ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}>
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              {isUploadingImages ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mb-2"></div>
                  <p className="text-sm text-gray-500">Đang tải ảnh...</p>
                </>
              ) : (
                <>
                  <ImagePlus className="w-8 h-8 mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Thêm ảnh</p>
                </>
              )}
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={isUploadingImages || isSubmitting}
            />
          </label>
        </div>
      </div>

      {/* Product Variants */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Biến thể sản phẩm</h3>
          <Button type="button" onClick={addVariant} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Thêm biến thể
          </Button>
        </div>

        {variantFields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">Biến thể {index + 1}</h4>
              {variantFields.length > 1 && (
                <Button
                  type="button"
                  onClick={() => removeVariant(index)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU
                </label>
                <Input
                  {...register(`variants.${index}.sku`)}
                  placeholder="Mã SKU (tự động tạo nếu để trống)"
                />
                {errors.variants?.[index]?.sku && (
                  <p className="text-red-600 text-sm mt-1">{errors.variants[index]?.sku?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên biến thể *
                </label>
                <Input
                  {...register(`variants.${index}.name`, { required: 'Tên biến thể là bắt buộc' })}
                  placeholder="Tên biến thể"
                />
                {errors.variants?.[index]?.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.variants[index]?.name?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tồn kho *
                </label>
                <Input
                  type="number"
                  {...register(`variants.${index}.stockQty`, { required: 'Số lượng tồn kho là bắt buộc', min: 0 })}
                  placeholder="0"
                />
                {errors.variants?.[index]?.stockQty && (
                  <p className="text-red-600 text-sm mt-1">{errors.variants[index]?.stockQty?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá bán *
                </label>
                <Controller
                  name={`variants.${index}.price`}
                  control={control}
                  rules={{ required: 'Giá bán là bắt buộc', min: 0 }}
                  render={({ field }) => (
                    <VNDInput
                      value={field.value}
                      onChange={field.onChange}
                      name={field.name}
                      placeholder="0"
                      error={errors.variants?.[index]?.price?.message}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá so sánh (giá gốc)
                </label>
                <Controller
                  name={`variants.${index}.compareAtPrice`}
                  control={control}
                  rules={{ min: 0 }}
                  render={({ field }) => (
                    <VNDInput
                      value={field.value}
                      onChange={field.onChange}
                      name={field.name}
                      placeholder="0"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trọng lượng (gram)
                </label>
                <Input
                  type="number"
                  {...register(`variants.${index}.weightGrams`, { min: 0 })}
                  placeholder="0"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Màu sắc
                  </label>
                  <Input
                    {...register(`variants.${index}.color`)}
                    placeholder="Ví dụ: Đỏ, Xanh, Đen..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kích thước
                  </label>
                  <Input
                    {...register(`variants.${index}.size`)}
                    placeholder="Ví dụ: S, M, L, XL hoặc 38, 39, 40..."
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {product ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
        </Button>
      </div>

      {/* Loading Modal Overlay */}
      {(isSubmitting || isUploadingImages) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-blue-600 mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">
              {isSubmitting 
                ? (product ? 'Đang cập nhật sản phẩm...' : 'Đang tạo sản phẩm...') 
                : 'Đang tải ảnh lên...'
              }
            </h3>
            <p className="text-sm text-gray-600 text-center max-w-sm">
              {isSubmitting 
                ? 'Đang xử lý dữ liệu và upload hình ảnh. Quá trình này có thể mất vài giây.' 
                : 'Vui lòng đợi trong giây lát...'
              }
            </p>
            {/* Progress dots animation */}
            <div className="flex space-x-1 mt-4">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      )}
      </form>
    </div>
  )
}
