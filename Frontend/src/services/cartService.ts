import { CartItem } from '@/types'

interface AddToCartRequest {
  productId: number
  variantId: number
  quantity: number
  userId?: number
}

interface CartApiService {
  addToCart: (item: AddToCartRequest, token: string, userId?: number) => Promise<void>
  removeFromCart: (productId: number, variantId: number, token: string) => Promise<boolean>
  updateQuantity: (productId: number, variantId: number, quantity: number, token: string) => Promise<boolean | object>
  getCart: (userId: number, token: string) => Promise<any | null>
  syncLocalCartToServer: (localCart: CartItem[], token: string, userId?: number) => Promise<boolean>
}

export const cartApiService: CartApiService = {
  async addToCart(item: AddToCartRequest, token: string, userId?: number) {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
    
    // Include userId in the request body
    const requestBody = {
      ...item,
      userId: userId || item.userId
    }
    
    const response = await fetch(`${apiUrl}/carts/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      throw new Error(`Failed to add item to cart: ${response.statusText}`)
    }
    
    return response.json()
  },

  async removeFromCart(productId: number, variantId: number, token: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
    
    const response = await fetch(`${apiUrl}/carts/products/${productId}/variants/${variantId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to remove item from cart: ${response.statusText}`)
    }
    
    return true
  },

  async updateQuantity(productId: number, variantId: number, quantity: number, token: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
    
    const response = await fetch(`${apiUrl}/carts/products/${productId}/variants/${variantId}/quantity`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    })
    
    if (!response.ok) {
      throw new Error(`Failed to update quantity: ${response.statusText}`)
    }
    
    // Don't try to parse JSON if response is empty
    const text = await response.text()
    return text ? JSON.parse(text) : true
  },

  async getCart(userId: number, token: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
    
    const response = await fetch(`${apiUrl}/carts/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null // No cart found
      }
      throw new Error(`Failed to get cart: ${response.statusText}`)
    }
    
    return response.json()
  },

  async syncLocalCartToServer(localCart: CartItem[], token: string, userId?: number) {
    // Convert local cart items to API format
    const cartItems = localCart.map(item => ({
      productId: item.productId,
      variantId: item.variantId || 0, // Use 0 if variantId is undefined
      quantity: item.quantity,
      userId: userId
    }))
    
    // Add each item to server cart
    const promises = cartItems.map(item => this.addToCart(item, token, userId))
    
    try {
      await Promise.all(promises)
      return true
    } catch (error) {
      throw error
    }
  }
}

export default cartApiService
