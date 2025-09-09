'use client'

import { useState } from 'react'
import { Search, Filter, Grid, List } from 'lucide-react'
import { Product, ProductFilters, Category } from '@/types'
import { cn, formatPrice } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Button from '@/components/ui/Button'

interface ProductCatalogProps {
  products: Product[]
  categories: Category[]
  isLoading?: boolean
  onProductClick: (product: Product) => void
  onAddToCart: (product: Product, variantId: string) => void
}

export default function ProductCatalog({
  products,
  categories,
  isLoading = false,
  onProductClick,
  onAddToCart
}: ProductCatalogProps) {
  const [filters, setFilters] = useState<ProductFilters>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'newest'>('newest')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }

    // Category filter
    if (filters.categoryId && product.categoryId !== filters.categoryId) {
      return false
    }

    // Brand filter
    if (filters.brand && product.brand !== filters.brand) {
      return false
    }

    // Price filter
    if (filters.minPrice || filters.maxPrice) {
      const minPrice = Math.min(...product.variants.map(v => v.price))
      if (filters.minPrice && minPrice < filters.minPrice) return false
      if (filters.maxPrice && minPrice > filters.maxPrice) return false
    }

    // Stock filter
    if (filters.inStock) {
      const hasStock = product.variants.some(v => v.stock > 0)
      if (!hasStock) return false
    }

    return true
  })

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price-asc':
        return Math.min(...a.variants.map(v => v.price)) - Math.min(...b.variants.map(v => v.price))
      case 'price-desc':
        return Math.min(...b.variants.map(v => v.price)) - Math.min(...a.variants.map(v => v.price))
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      default:
        return 0
    }
  })

  const uniqueBrands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)))

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-80"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? "primary" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price-asc' | 'price-desc' | 'newest')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="newest">Newest</option>
            <option value="name">Name A-Z</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>

          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "p-2 text-sm",
                viewMode === 'grid' ? "bg-gray-100" : "hover:bg-gray-50"
              )}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "p-2 text-sm border-l border-gray-300",
                viewMode === 'list' ? "bg-gray-100" : "hover:bg-gray-50"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={filters.categoryId || ''}
                  onChange={(e) => setFilters({ ...filters, categoryId: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Brand</label>
                <select
                  value={filters.brand || ''}
                  onChange={(e) => setFilters({ ...filters, brand: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Brands</option>
                  {uniqueBrands.map(brand => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Min Price</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPrice || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    minPrice: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Max Price</label>
                <Input
                  type="number"
                  placeholder="1000000"
                  value={filters.maxPrice || ''}
                  onChange={(e) => setFilters({ 
                    ...filters, 
                    maxPrice: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.inStock || false}
                  onChange={(e) => setFilters({ ...filters, inStock: e.target.checked })}
                  className="mr-2"
                />
                In Stock Only
              </label>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({})
                  setSearchQuery('')
                }}
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      <div className="text-sm text-gray-600">
        {sortedProducts.length} products found
      </div>

      {/* Products Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {sortedProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
              onAddToCart={(variantId) => onAddToCart(product, variantId)}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {sortedProducts.map(product => (
            <ProductListItem
              key={product.id}
              product={product}
              onClick={() => onProductClick(product)}
              onAddToCart={(variantId) => onAddToCart(product, variantId)}
            />
          ))}
        </div>
      )}

      {sortedProducts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}

function ProductCard({ 
  product, 
  onClick, 
  onAddToCart 
}: { 
  product: Product
  onClick: () => void
  onAddToCart: (variantId: string) => void
}) {
  const defaultVariant = product.variants[0]
  const hasStock = product.variants.some(v => v.stock > 0)

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
        <div onClick={onClick}>
          <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {product.shortDescription || product.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-gray-900">
                {formatPrice(defaultVariant.price)}
              </span>
              {!hasStock && (
                <span className="text-xs text-red-600 font-medium">Out of Stock</span>
              )}
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <Button
            fullWidth
            disabled={!hasStock}
            onClick={(e) => {
              e.stopPropagation()
              onAddToCart(defaultVariant.id)
            }}
          >
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ProductListItem({ 
  product, 
  onClick, 
  onAddToCart 
}: { 
  product: Product
  onClick: () => void
  onAddToCart: (variantId: string) => void
}) {
  const defaultVariant = product.variants[0]
  const hasStock = product.variants.some(v => v.stock > 0)

  return (
    <Card className="group cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4" onClick={onClick}>
          <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">
              {product.name}
            </h3>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {product.shortDescription || product.description}
            </p>
            <div className="flex items-center justify-between">
              <span className="font-bold text-lg text-gray-900">
                {formatPrice(defaultVariant.price)}
              </span>
              {!hasStock && (
                <span className="text-xs text-red-600 font-medium">Out of Stock</span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center">
            <Button
              disabled={!hasStock}
              onClick={(e) => {
                e.stopPropagation()
                onAddToCart(defaultVariant.id)
              }}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
