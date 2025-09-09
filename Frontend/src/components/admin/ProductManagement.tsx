'use client'

import { useState, useEffect, useMemo } from 'react'
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form'
import { Product, ProductForm, Category } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Button from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import { useProducts } from '@/hooks/useProducts'
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

export type ProductManagementProps = {
  products: Product[]
  categories: Category[]
  onCreateProduct: (productData: ProductForm) => Promise<void>
  onUpdateProduct: (id: string, productData: ProductForm) => Promise<void>
  onDeleteProduct: (id: string) => Promise<void>
  onToggleStatus: (id: string, isActive: boolean) => Promise<void>
  isLoading: boolean
}


export default function ProductManagement({
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleStatus
}: ProductManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedParentCategory, setSelectedParentCategory] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // Fetch categories and products using hooks
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories()
  
  // Memoize filters to prevent unnecessary re-renders
  const productFilters = useMemo(() => ({
    search: searchQuery,
    categoryId: selectedCategory,
    page: 1,
    pageSize: 50
  }), [searchQuery, selectedCategory])
  
  const { products, pagination, loading: productsLoading, error: productsError } = useProducts(productFilters)

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
    active: products.filter(p => p.isActive).length,
    outOfStock: products.filter(p => p.variants && Array.isArray(p.variants) && p.variants.every(v => v.stock === 0)).length,
    lowStock: products.filter(p => p.variants && Array.isArray(p.variants) && p.variants.some(v => v.stock > 0 && v.stock <= 10)).length
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
                onCreateProduct(data)
                setIsCreateModalOpen(false)
              }}
              onCancel={() => setIsCreateModalOpen(false)}
              categories={categories}
              categoriesLoading={categoriesLoading}
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
            <table className="w-full">
              <thead>
                <tr className="border-b">
                <th className="text-left py-3 px-4">Sản phẩm</th>
                <th className="text-left py-3 px-4">Danh mục</th>
                <th className="text-left py-3 px-4">Khoảng giá</th>
                <th className="text-left py-3 px-4">Tồn kho</th>
                <th className="text-left py-3 px-4">Trạng thái</th>
                <th className="text-left py-3 px-4">Ngày tạo</th>
                <th className="text-left py-3 px-4">Hành động</th>
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
                    onDelete={() => onDeleteProduct(String(product.id))}
                    onToggleStatus={(status) => onToggleStatus(String(product.id), status)}
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
                onUpdateProduct(String(selectedProduct.id), data)
                setIsEditModalOpen(false)
                setSelectedProduct(null)
              }}
              onCancel={() => {
                setIsEditModalOpen(false)
                setSelectedProduct(null)
              }}
              categories={categories}
              categoriesLoading={categoriesLoading}
            />
          )}
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
  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0)
  const isLowStock = totalStock > 0 && totalStock <= 10
  const isOutOfStock = totalStock === 0

  return (
    <>
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
               onClick={() => product.primaryImageUrl && setShowImageModal(true)}>
            {product.primaryImageUrl ? (
              <img
                src={product.primaryImageUrl}
                alt={product.name}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">{product.name}</p>
            <p className="text-sm text-gray-600 line-clamp-1">{product.shortDescription}</p>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600">{product.categoryName || "N/A"}</span>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm font-medium">
          {minPrice === maxPrice 
            ? formatPrice(minPrice)
            : `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
          }
        </span>
      </td>
      <td className="py-3 px-4">
        <span className={`text-sm font-medium ${
          isOutOfStock ? 'text-red-600' : 
          isLowStock ? 'text-yellow-600' : 
          'text-green-600'
        }`}>
          {totalStock}
        </span>
      </td>
      <td className="py-3 px-4">
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
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600">
          {product.createdAt ? formatDate(product.createdAt) : 'N/A'}
        </span>
      </td>
      <td className="py-3 px-4">
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
  categoriesLoading 
}: {
  product?: Product
  onSubmit: SubmitHandler<ProductForm>
  onCancel: () => void
  categories: Category[]
  categoriesLoading: boolean
}) {
  const [selectedParentCategory, setSelectedParentCategory] = useState('')
  const [selectedChildCategory, setSelectedChildCategory] = useState('')
  const [productImages, setProductImages] = useState<string[]>([])

  // Separate parent and child categories
  const parentCategories = categories.filter(cat => cat.parentId === null || cat.parentId === undefined)
  const childCategories = categories.filter(cat => {
    // Handle both string and number types for parentId
    const selectedParentId = selectedParentCategory ? Number(selectedParentCategory) : null
    const categoryParentId = typeof cat.parentId === 'string' ? Number(cat.parentId) : cat.parentId
    return categoryParentId === selectedParentId
  })
  
  const { register, handleSubmit, formState: { errors }, setValue, control } = useForm<ProductForm>({
    defaultValues: product ? {
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      categoryId: product.categoryId,
      brandId: product.brandId !== undefined && product.brandId !== null ? String(product.brandId) : '',
      tags: product.tags || [],
      status: product.status,
      isFeatured: product.isFeatured,
      variants: product.variants.map(v => ({
        sku: v.sku,
        name: v.name,
        price: v.price,
        originalPrice: v.originalPrice,
        stock: v.stock,
        attributes: v.attributes,
        images: v.images,
        isActive: v.isActive
      }))
    } : {
      name: '',
      description: '',
      shortDescription: '',
      categoryId: 0,
      brandId: '',
      tags: [],
      status: 'ACTIVE',
      isFeatured: false,
      variants: [{
        sku: '',
        name: 'Default',
        price: 0,
        originalPrice: 0,
        stock: 0,
        attributes: {},
        images: [],
        isActive: true
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
      setProductImages(product.images || [])
      
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
    }
  }, [product, categories])

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      // In a real app, you'd upload these files to your server/cloud storage
      // For now, we'll just simulate URLs
      const newImages = Array.from(files).map(file => URL.createObjectURL(file))
      setProductImages(prev => [...prev, ...newImages])
    }
  }

  const removeImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index))
  }

  const addVariant = () => {
    appendVariant({
      sku: '',
      name: '',
      price: 0,
      originalPrice: 0,
      stock: 0,
      attributes: {},
      images: [],
      isActive: true
    })
  }

  const handleFormSubmit = (data: ProductForm) => {
    // Add images to form data
    const formData = {
      ...data,
      images: productImages
    }
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
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
            <Input
              {...register('brandId')}
              placeholder="ID thương hiệu"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mô tả ngắn
          </label>
          <Input
            {...register('shortDescription')}
            placeholder="Mô tả ngắn gọn về sản phẩm"
          />
        </div>

        <div>
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

          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                {...register('isFeatured')}
                className="mr-2"
              />
              Sản phẩm nổi bật
            </label>
          </div>
        </div>
      </div>

      {/* Product Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Hình ảnh sản phẩm</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {productImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Product image ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg border"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <ImagePlus className="w-8 h-8 mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">Thêm ảnh</p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
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
                  SKU *
                </label>
                <Input
                  {...register(`variants.${index}.sku`, { required: 'SKU là bắt buộc' })}
                  placeholder="Mã SKU"
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
                  {...register(`variants.${index}.stock`, { required: 'Số lượng tồn kho là bắt buộc', min: 0 })}
                  placeholder="0"
                />
                {errors.variants?.[index]?.stock && (
                  <p className="text-red-600 text-sm mt-1">{errors.variants[index]?.stock?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá bán *
                </label>
                <Input
                  type="number"
                  {...register(`variants.${index}.price`, { required: 'Giá bán là bắt buộc', min: 0 })}
                  placeholder="0"
                />
                {errors.variants?.[index]?.price && (
                  <p className="text-red-600 text-sm mt-1">{errors.variants[index]?.price?.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Giá gốc
                </label>
                <Input
                  type="number"
                  {...register(`variants.${index}.originalPrice`, { min: 0 })}
                  placeholder="0"
                />
              </div>

              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register(`variants.${index}.isActive`)}
                    className="mr-2"
                  />
                  Biến thể hoạt động
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">
          {product ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm'}
        </Button>
      </div>
    </form>
  )
}
