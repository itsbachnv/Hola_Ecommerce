import { CartItem } from '@/types'

interface AddToCartRequest {
  productId: number
  variantId: number
  quantity: number
}

interface CartApiService {
  addToCart: (item: AddToCartRequest, token: string) => Promise<void>
  syncLocalCartToServer: (localCart: CartItem[], token: string) => Promise<boolean>
}

export const cartApiService: CartApiService = {
  async addToCart(item: AddToCartRequest, token: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
    
    const response = await fetch(`${apiUrl}/carts/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(item)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to add item to cart: ${response.statusText}`)
    }
    
    return response.json()
  },

  async syncLocalCartToServer(localCart: CartItem[], token: string) {
    // Convert local cart items to API format
    const cartItems = localCart.map(item => ({
      productId: item.productId,
      variantId: item.variantId || 0, // Use 0 if variantId is undefined
      quantity: item.quantity
    }))
    
    // Add each item to server cart
    const promises = cartItems.map(item => this.addToCart(item, token))
    
    try {
      await Promise.all(promises)
      return true
    } catch (error) {
      console.error('Error syncing cart to server:', error)
      throw error
    }
  }
}

export default cartApiService
