'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Product, ProductForm, Category } from '@/types'
import { formatPrice, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import Button from '@/components/ui/Button'
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
  AlertTriangle
} from 'lucide-react'

interface ProductManagementProps {
  products: Product[]
  categories: Category[]
  onCreateProduct: (product: ProductForm) => void
  onUpdateProduct: (id: string, product: ProductForm) => void
  onDeleteProduct: (id: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
  isLoading?: boolean
}

export default function ProductManagement({
  products,
  categories,
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
  onToggleStatus,
  isLoading = false
}: ProductManagementProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = !selectedCategory || product.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const stats = {
    total: products.length,
    active: products.filter(p => p.isActive).length,
    outOfStock: products.filter(p => p.variants.every(v => v.stock === 0)).length,
    lowStock: products.filter(p => p.variants.some(v => v.stock > 0 && v.stock <= 10)).length
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
              <DialogTitle>Create New Product</DialogTitle>
            </DialogHeader>
            <ProductForm
              categories={categories}
              onSubmit={(data) => {
                onCreateProduct(data)
                setIsCreateModalOpen(false)
              }}
              onCancel={() => setIsCreateModalOpen(false)}
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
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
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
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Product</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Price Range</th>
                  <th className="text-left py-3 px-4">Stock</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Created</th>
                  <th className="text-left py-3 px-4">Actions</th>
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
                    onDelete={() => onDeleteProduct(product.id)}
                    onToggleStatus={(isActive) => onToggleStatus(product.id, isActive)}
                  />
                ))}
              </tbody>
            </table>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">
                  {searchQuery || selectedCategory
                    ? 'No products match your filters.'
                    : 'Get started by creating your first product.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <ProductForm
              product={selectedProduct}
              categories={categories}
              onSubmit={(data) => {
                onUpdateProduct(selectedProduct.id, data)
                setIsEditModalOpen(false)
                setSelectedProduct(null)
              }}
              onCancel={() => {
                setIsEditModalOpen(false)
                setSelectedProduct(null)
              }}
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
  
  const minPrice = Math.min(...product.variants.map(v => v.price))
  const maxPrice = Math.max(...product.variants.map(v => v.price))
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0)
  const isLowStock = totalStock > 0 && totalStock <= 10
  const isOutOfStock = totalStock === 0

  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
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
        <span className="text-sm text-gray-600">{product.category?.name}</span>
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
          onClick={() => onToggleStatus(!product.isActive)}
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            product.isActive
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {product.isActive ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td className="py-3 px-4">
        <span className="text-sm text-gray-600">{formatDate(product.createdAt)}</span>
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
  )
}

function ProductForm({ 
  product, 
  categories, 
  onSubmit, 
  onCancel 
}: {
  product?: Product
  categories: Category[]
  onSubmit: (data: ProductForm) => void
  onCancel: () => void
}) {
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<ProductForm>({
    defaultValues: product ? {
      name: product.name,
      description: product.description,
      shortDescription: product.shortDescription,
      categoryId: product.categoryId,
      brand: product.brand,
      tags: product.tags,
      isActive: product.isActive,
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
      isActive: true,
      isFeatured: false,
      tags: [],
      variants: [{
        sku: '',
        name: '',
        price: 0,
        stock: 0,
        attributes: {},
        images: [],
        isActive: true
      }]
    }
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name *
          </label>
          <Input
            {...register('name', { required: 'Product name is required' })}
            placeholder="Enter product name"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <select
            {...register('categoryId', { required: 'Category is required' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-600 text-sm mt-1">{errors.categoryId.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description *
        </label>
        <textarea
          {...register('description', { required: 'Description is required' })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="Enter product description"
        />
        {errors.description && (
          <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Short Description
          </label>
          <Input
            {...register('shortDescription')}
            placeholder="Brief product description"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brand
          </label>
          <Input
            {...register('brand')}
            placeholder="Product brand"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('isActive')}
            className="mr-2"
          />
          Active
        </label>
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('isFeatured')}
            className="mr-2"
          />
          Featured
        </label>
      </div>

      {/* Variants section would be more complex - simplified for now */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Product Variants</h3>
        <p className="text-sm text-gray-600 mb-4">Variant management would be implemented here with dynamic forms</p>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  )
}
