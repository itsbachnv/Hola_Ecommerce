'use client'

import { useState } from 'react'
import { Star, Heart, Share2, Minus, Plus, ShoppingCart, Truck, Shield, RotateCcw } from 'lucide-react'
import { Product, ProductVariant } from '@/types'
import { cn, formatPrice } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/Button'

interface ProductDetailProps {
  product: Product
  onAddToCart: (variant: ProductVariant, quantity: number) => void
  onClose?: () => void
  relatedProducts?: Product[]
}

export default function ProductDetail({
  product,
  onAddToCart,
  onClose,
  relatedProducts = []
}: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.variants[0])
  const [quantity, setQuantity] = useState(1)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)

  // Get available attributes (like color, size)
  const attributes = product.variants.reduce((acc, variant) => {
    Object.entries(variant.attributes).forEach(([key, value]) => {
      if (!acc[key]) acc[key] = new Set()
      acc[key].add(value)
    })
    return acc
  }, {} as Record<string, Set<string>>)

  const handleAttributeChange = (attributeName: string, value: string) => {
    const newVariant = product.variants.find(variant => 
      variant.attributes[attributeName] === value &&
      Object.entries(selectedVariant.attributes)
        .filter(([key]) => key !== attributeName)
        .every(([key, val]) => variant.attributes[key] === val)
    )
    
    if (newVariant) {
      setSelectedVariant(newVariant)
      setSelectedImageIndex(0) // Reset to first image
    }
  }

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= selectedVariant.stock) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = () => {
    onAddToCart(selectedVariant, quantity)
  }

  const allImages = [...product.images, ...selectedVariant.images]
  const currentImage = allImages[selectedImageIndex] || product.images[0]

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <span>Home</span> / <span>{product.category?.name}</span> / <span className="text-gray-900">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {currentImage ? (
              <img
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
          </div>
          
          {allImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {allImages.slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={cn(
                    "aspect-square bg-gray-100 rounded-lg overflow-hidden border-2",
                    selectedImageIndex === index ? "border-blue-500" : "border-transparent"
                  )}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-5 h-5",
                      i < 4 ? "text-yellow-400 fill-current" : "text-gray-300"
                    )}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-600">(4.0) • 124 reviews</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={cn(
                    "p-2 rounded-full transition-colors",
                    isFavorite ? "text-red-500 bg-red-50" : "text-gray-400 hover:text-red-500"
                  )}
                >
                  <Heart className="w-5 h-5" fill={isFavorite ? "currentColor" : "none"} />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-gray-900">
              {formatPrice(selectedVariant.price)}
            </span>
            {selectedVariant.originalPrice && selectedVariant.originalPrice > selectedVariant.price && (
              <span className="text-xl text-gray-500 line-through">
                {formatPrice(selectedVariant.originalPrice)}
              </span>
            )}
          </div>

          {/* Variant Selection */}
          {Object.entries(attributes).map(([attributeName, values]) => (
            <div key={attributeName}>
              <label className="block text-sm font-medium text-gray-900 mb-2 capitalize">
                {attributeName}: {selectedVariant.attributes[attributeName]}
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from(values).map((value) => {
                  const isSelected = selectedVariant.attributes[attributeName] === value
                  const isAvailable = product.variants.some(v => 
                    v.attributes[attributeName] === value && v.stock > 0
                  )
                  
                  return (
                    <button
                      key={value}
                      onClick={() => handleAttributeChange(attributeName, value)}
                      disabled={!isAvailable}
                      className={cn(
                        "px-4 py-2 border rounded-md text-sm font-medium transition-colors",
                        isSelected
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : isAvailable
                            ? "border-gray-300 text-gray-700 hover:border-gray-400"
                            : "border-gray-200 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Quantity and Add to Cart */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Quantity
              </label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <Input
                    type="number"
                    min="1"
                    max={selectedVariant.stock}
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (value >= 1 && value <= selectedVariant.stock) {
                        setQuantity(value)
                      }
                    }}
                    className="w-20 text-center border-0 focus:ring-0"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= selectedVariant.stock}
                    className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-gray-600">
                  {selectedVariant.stock} available
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                fullWidth
                onClick={handleAddToCart}
                disabled={selectedVariant.stock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="primary"
                fullWidth
                disabled={selectedVariant.stock === 0}
              >
                Buy Now
              </Button>
            </div>

            {selectedVariant.stock === 0 && (
              <p className="text-red-600 text-sm font-medium">This variant is out of stock</p>
            )}
          </div>

          {/* Features */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Free shipping on orders over 500,000₫</span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-gray-700">2 year warranty</span>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-purple-600" />
                <span className="text-sm text-gray-700">30-day return policy</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Description */}
      <div className="mt-12">
        <div className="border-b">
          <nav className="-mb-px flex space-x-8">
            <button className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
              Description
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
              Reviews (124)
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700">
              Shipping Info
            </button>
          </nav>
        </div>

        <div className="py-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.slice(0, 4).map(relatedProduct => (
              <RelatedProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RelatedProductCard({ product }: { product: Product }) {
  const defaultVariant = product.variants[0]
  
  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-shadow">
      <CardContent className="p-0">
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
          <span className="font-bold text-lg text-gray-900">
            {formatPrice(defaultVariant.price)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
