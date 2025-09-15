import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Product, ProductVariant } from '@/types'
import { cartApiService } from '@/services/cartService'

// Server cart item structure from API
interface ServerCartItem {
  id: number
  cartId: number
  productId: number
  variantId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  createdAt: string
  product: Product
  variant: ProductVariant
}

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
  addItem: (product: Product, variant: ProductVariant, quantity?: number, token?: string, userId?: number) => Promise<void>
  removeItem: (itemId: string, token?: string, userId?: number) => Promise<void>
  updateQuantity: (itemId: string, quantity: number, token?: string, userId?: number) => Promise<void>
  clearCart: () => void
  loadCartFromServer: (token: string, userId: number) => Promise<void>
  syncToServer: (token: string, userId?: number) => Promise<void>
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: null,
      
      addItem: async (product, variant, quantity = 1, token, userId) => {
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
        if (token && userId) {
          try {
            await cartApiService.addToCart({
              productId: product.id,
              variantId: variant.id,
              quantity,
              userId
            }, token, userId)
          } catch {
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
      
      removeItem: async (itemId, token, userId) => {
        const currentCart = get().cart
        if (!currentCart) return

        const item = currentCart.items.find(item => item.id === itemId)
        if (!item) return

        // If user is authenticated, remove from server first
        if (token && userId) {
          try {
            await cartApiService.removeFromCart(item.productId, item.variantId, token)
          } catch {

          }
        }
        
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
      
      updateQuantity: async (itemId, quantity, token, userId) => {
        const currentCart = get().cart
        if (!currentCart) return
        
        if (quantity <= 0) {
          await get().removeItem(itemId, token, userId)
          return
        }

        const item = currentCart.items.find(item => item.id === itemId)
        if (!item) return

        // If user is authenticated, update on server first
        if (token && userId) {
          try {
            await cartApiService.updateQuantity(item.productId, item.variantId, quantity, token)
          } catch {

          }
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

      loadCartFromServer: async (token: string, userId: number) => {
        try {
          const serverCart = await cartApiService.getCart(userId, token)
          
          if (serverCart && serverCart.items && serverCart.items.length > 0) {
            // Convert server cart to local cart format with safe guards
            const localItems: LocalCartItem[] = serverCart.items.map((serverItemRaw: unknown) => {
              // server may return nested product/variant or flattened fields (productName, variantName, productImage, unitPrice)
              const serverItem = serverItemRaw as unknown as Record<string, unknown>

              const product: Product = serverItem.product ?? {
                id: serverItem.productId,
                name: serverItem.productName ?? 'Unknown product',
                images: serverItem.productImage ? [{ url: serverItem.productImage }] : [],
                primaryImageUrl: serverItem.productImage ?? null,
                slug: serverItem.product && (serverItem.product as any).slug
                  ? (serverItem.product as any).slug
                  : (serverItem.productName
                      ? serverItem.productName.toString().toLowerCase().replace(/\s+/g, '-')
                      : 'unknown-product')
              } as unknown as Product

              // Preserve and normalize attributes if present. Server may return attributes in many shapes:
              // - serverItem.variant.attributes (object or JSON string)
              // - serverItem.attributes (object or JSON string)
              // - serverItem.variantAttributes
              // - variant.attributeValues (array of { key, value })
              // - or even a short key like 'r'
              const candidates = [
                serverItem.variant && (serverItem.variant as any).attributes,
                (serverItem as any).attributes,
                (serverItem as any).variantAttributes,
                serverItem.variant && (serverItem.variant as any).attributeValues,
                (serverItem as any).attributeValues,
                (serverItem as any).r,
                serverItem.variant && (serverItem.variant as any).r
              ]

              let parsedAttributes: Record<string, unknown> | undefined = undefined

              for (const candidate of candidates) {
                if (!candidate) continue

                // If candidate is string, try parse JSON
                if (typeof candidate === 'string') {
                  try {
                    const p = JSON.parse(candidate)
                    if (p && typeof p === 'object') {
                      parsedAttributes = p as Record<string, unknown>
                      break
                    }
                  } catch {
                    // treat string as a single attribute value under key 'value'
                    parsedAttributes = { value: candidate }
                    break
                  }
                }

                // If candidate is an array of key/value pairs
                if (Array.isArray(candidate)) {
                  const obj: Record<string, unknown> = {}
                  for (const it of candidate as any[]) {
                    if (!it) continue
                    if (typeof it === 'object') {
                      const k = it.key ?? it.name ?? it.attribute ?? it.attr
                      const v = it.value ?? it.val ?? it.valueText ?? it.text ?? undefined
                      if (k) obj[String(k)] = v ?? (it as any).v ?? (it as any).t ?? null
                    }
                  }
                  parsedAttributes = obj
                  break
                }

                // If candidate is object-like, use it
                if (typeof candidate === 'object') {
                  parsedAttributes = candidate as Record<string, unknown>
                  break
                }
              }

              const variant: ProductVariant = serverItem.variant ?? {
                id: (serverItem as any).variantId ?? 0,
                price: (serverItem as any).unitPrice ?? (serverItem as any).totalPrice ?? 0,
                attributes: parsedAttributes ?? undefined,
                stockQty: undefined
              } as unknown as ProductVariant

              return {
                id: `${serverItem.id}-${serverItem.productId}-${serverItem.variantId ?? 0}-${Date.now()}`,
                productId: serverItem.productId,
                variantId: serverItem.variantId ?? 0,
                product,
                variant,
                quantity: serverItem.quantity ?? 0,
                addedAt: serverItem.createdAt || new Date().toISOString()
              }
            })

            const total = localItems.reduce((sum, item) => {
              const price = Number((item.variant as unknown as { price?: number })?.price ?? 0)
              return sum + (price * item.quantity)
            }, 0)

            const localCart: LocalCart = {
              id: `cart-${userId}`,
              items: localItems,
              total,
              itemCount: localItems.reduce((sum, item) => sum + item.quantity, 0),
              updatedAt: new Date().toISOString()
            }

            // Persist into store (persist middleware will write to localStorage)
            set({ cart: localCart })
          } else {
            // No cart on server, clear local cart
            set({ cart: null })
          }
  } catch {

  }
      },

      syncToServer: async (token: string, userId?: number) => {
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

          await cartApiService.syncLocalCartToServer(cartItemsForApi, token, userId)
          
          // Clear local cart after successful sync
          set({ cart: null })
        } catch (err) {

          throw err
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
