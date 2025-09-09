'use client'

import { useState } from 'react'
import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { CartItem } from '@/types'
import { cn, formatPrice } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/Button'
import { useCartStore } from '@/stores/cart'

interface ShoppingCartProps {
  isOpen: boolean
  onClose: () => void
  onCheckout: () => void
}

export default function ShoppingCart({ isOpen, onClose, onCheckout }: ShoppingCartProps) {
  const { cart, updateQuantity, removeItem, clearCart, getTotal, getItemCount } = useCartStore()

  if (!isOpen) return null

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const itemCount = getItemCount()
  const total = getTotal()

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Cart Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Shopping Cart ({itemCount})
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4">
            {!cart || cart.items.length === 0 ? (
              <EmptyCart onClose={onClose} />
            ) : (
              <div className="space-y-4">
                {cart.items.map((item) => (
                  <CartItemComponent
                    key={item.id}
                    item={item}
                    onQuantityChange={(quantity) => handleQuantityChange(item.id, quantity)}
                    onRemove={() => removeItem(item.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cart && cart.items.length > 0 && (
            <div className="border-t bg-gray-50 p-4 space-y-4">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <Button
                  fullWidth
                  variant="primary"
                  onClick={onCheckout}
                >
                  Checkout
                </Button>
                <Button
                  fullWidth
                  variant="outline"
                  onClick={onClose}
                >
                  Continue Shopping
                </Button>
                <button
                  onClick={clearCart}
                  className="w-full text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function CartItemComponent({ 
  item, 
  onQuantityChange, 
  onRemove 
}: { 
  item: CartItem
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}) {
  const [quantity, setQuantity] = useState(item.quantity)

  const handleQuantityUpdate = (newQuantity: number) => {
    setQuantity(newQuantity)
    onQuantityChange(newQuantity)
  }

  const itemTotal = item.variant.price * item.quantity

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
            {item.product.images[0] ? (
              <img
                src={item.product.images[0]}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                No Image
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-gray-900 text-sm line-clamp-2">
              {item.product.name}
            </h3>
            
            {/* Variant attributes */}
            {Object.keys(item.variant.attributes).length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                {Object.entries(item.variant.attributes).map(([key, value]) => (
                  <span key={key} className="mr-2">
                    {key}: {value}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <span className="text-sm font-semibold text-gray-900">
                {formatPrice(item.variant.price)}
              </span>
              
              {/* Quantity Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-gray-300 rounded">
                  <button
                    onClick={() => handleQuantityUpdate(quantity - 1)}
                    className="p-1 hover:bg-gray-50 text-gray-500"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <Input
                    type="number"
                    min="1"
                    max={item.variant.stock}
                    value={quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      if (value >= 1 && value <= item.variant.stock) {
                        handleQuantityUpdate(value)
                      }
                    }}
                    className="w-12 text-center text-sm border-0 focus:ring-0 p-1"
                  />
                  <button
                    onClick={() => handleQuantityUpdate(quantity + 1)}
                    disabled={quantity >= item.variant.stock}
                    className="p-1 hover:bg-gray-50 text-gray-500 disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
                
                <button
                  onClick={onRemove}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Item Total */}
            <div className="text-right mt-2">
              <span className="text-sm font-semibold text-gray-900">
                {formatPrice(itemTotal)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <ShoppingBag className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
      <p className="text-gray-500 mb-6">Add some products to get started!</p>
      <Button onClick={onClose}>
        Continue Shopping
      </Button>
    </div>
  )
}

// Mini Cart Component for header
export function MiniCart({ itemCount, total, onClick }: {
  itemCount: number
  total: number
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <ShoppingBag className="w-6 h-6" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
      {itemCount > 0 && (
        <div className="absolute top-full right-0 mt-1 text-xs text-gray-600 whitespace-nowrap">
          {formatPrice(total)}
        </div>
      )}
    </button>
  )
}
