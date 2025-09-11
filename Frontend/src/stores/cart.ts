import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, ProductVariant } from '@/types'
import { cartApiService } from '@/services/cartService'

// Local cart item structure for localStorage
interface LocalCartItem {
  id: string
  productId: number
  variantId: number
  product: Product
  variant: ProductVariant
  quantity: number
  addedAt: string
}

// Local cart structure for localStorage
interface LocalCart {
  id: string
  items: LocalCartItem[]
  total: number
  itemCount: number
  updatedAt: string
}

interface CartStore {
  cart: LocalCart | null
  addItem: (product: Product, variant: ProductVariant, quantity?: number, token?: string) => Promise<void>
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  syncToServer: (token: string) => Promise<void>
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      
      addItem: async (product, variant, quantity = 1, token) => {
        const currentCart = get().cart
        const newItem: LocalCartItem = {
          id: `${product.id}-${variant.id}-${Date.now()}`,
          productId: product.id,
          variantId: variant.id,
          product,
          variant,
          quantity,
          addedAt: new Date().toISOString()
        }

        // If user is authenticated and token provided, add to server first
        if (token) {
          try {
            await cartApiService.addToCart({
              productId: product.id,
              variantId: variant.id,
              quantity
            }, token)
          } catch (error) {
            console.error('Failed to add item to server cart:', error)
            // Continue to add to localStorage as fallback
          }
        }
        
        if (!currentCart) {
          set({
            cart: {
              id: `cart-${Date.now()}`,
              items: [newItem],
              total: variant.price * quantity,
              itemCount: quantity,
              updatedAt: new Date().toISOString()
            }
          })
          return
        }
        
        // Check if item already exists
        const existingItemIndex = currentCart.items.findIndex(
          item => item.productId === product.id && item.variantId === variant.id
        )
        
        if (existingItemIndex >= 0) {
          // Update existing item
          const updatedItems = [...currentCart.items]
          updatedItems[existingItemIndex].quantity += quantity
          
          set({
            cart: {
              ...currentCart,
              items: updatedItems,
              total: updatedItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0),
              itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
              updatedAt: new Date().toISOString()
            }
          })
        } else {
          // Add new item
          const updatedItems = [...currentCart.items, newItem]
          set({
            cart: {
              ...currentCart,
              items: updatedItems,
              total: updatedItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0),
              itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
              updatedAt: new Date().toISOString()
            }
          })
        }
      },
      
      removeItem: (itemId) => {
        const currentCart = get().cart
        if (!currentCart) return
        
        const updatedItems = currentCart.items.filter(item => item.id !== itemId)
        set({
          cart: {
            ...currentCart,
            items: updatedItems,
            total: updatedItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0),
            itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            updatedAt: new Date().toISOString()
          }
        })
      },
      
      updateQuantity: (itemId, quantity) => {
        const currentCart = get().cart
        if (!currentCart) return
        
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }
        
        const updatedItems = currentCart.items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
        
        set({
          cart: {
            ...currentCart,
            items: updatedItems,
            total: updatedItems.reduce((sum, item) => sum + (item.variant.price * item.quantity), 0),
            itemCount: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
            updatedAt: new Date().toISOString()
          }
        })
      },
      
      clearCart: () => {
        set({ cart: null })
      },

      syncToServer: async (token: string) => {
        const currentCart = get().cart
        if (!currentCart || currentCart.items.length === 0) return

        try {
          // Convert LocalCartItem to CartItem format for the API
          const cartItemsForApi = currentCart.items.map(item => ({
            id: parseInt(item.id.split('-')[0]) || 0,
            cartId: 0,
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.variant.price,
            totalPrice: item.variant.price * item.quantity,
            createdAt: item.addedAt,
            product: item.product,
            variant: item.variant
          }))

          await cartApiService.syncLocalCartToServer(cartItemsForApi, token)
          
          // Clear local cart after successful sync
          set({ cart: null })
        } catch (error) {
          console.error('Failed to sync cart to server:', error)
          throw error
        }
      },
      
      getTotal: () => {
        const cart = get().cart
        return cart?.total || 0
      },
      
      getItemCount: () => {
        const cart = get().cart
        return cart?.itemCount || 0
      }
    }),
    {
      name: 'cart-storage'
    }
  )
)
