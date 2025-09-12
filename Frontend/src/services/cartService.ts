import api from '@/utils/api';
// Helper: build headers for ngrok
function getApiHeaders(apiUrl: string, extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = extra ? { ...extra } : {};
  if (apiUrl.includes('.ngrok-free.app')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}
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
    
    const res = await api.post(`${apiUrl}/carts/add`, requestBody, {
      headers: getApiHeaders(apiUrl, {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    });
    return res.data;
  },

  async removeFromCart(productId: number, variantId: number, token: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
    
    await api.delete(`${apiUrl}/carts/products/${productId}/variants/${variantId}`, {
      headers: getApiHeaders(apiUrl, {
        'Authorization': `Bearer ${token}`
      })
    });
    return true;
  },

  async updateQuantity(productId: number, variantId: number, quantity: number, token: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
    
    const res = await api.put(`${apiUrl}/carts/products/${productId}/variants/${variantId}/quantity`, { quantity }, {
      headers: getApiHeaders(apiUrl, {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    });
    return res.data ?? true;
  },

  async getCart(userId: number, token: string) {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
    
    try {
      const res = await api.get(`${apiUrl}/carts/${userId}`, {
        headers: getApiHeaders(apiUrl, {
          'Authorization': `Bearer ${token}`
        })
      });
      return res.data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      throw new Error(`Failed to get cart: ${error?.message || 'Unknown error'}`);
    }
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
