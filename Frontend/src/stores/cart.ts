import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Cart, CartItem, Product, ProductVariant } from '@/types'

interface CartStore {
  cart: Cart | null
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      
      addItem: (product, variant, quantity = 1) => {
        const currentCart = get().cart
        const newItem: CartItem = {
          id: `${product.id}-${variant.id}-${Date.now()}`,
          productId: product.id,
          variantId: variant.id,
          product,
          variant,
          quantity,
          addedAt: new Date().toISOString()
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
