import api from '@/utils/api';
// Helper: build headers for ngrok
function getApiHeaders(apiUrl: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (apiUrl.includes('.ngrok-free.app')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}
import { User, LoginForm, RegisterForm } from '@/types'

// API Response types
interface LoginResponse {
  user: User
  token: string
}

interface RegisterResponse {
  user: User
}

interface AuthApiService {
  login: (credentials: LoginForm) => Promise<LoginResponse>
  register: (userData: RegisterForm) => Promise<RegisterResponse>
  logout: () => Promise<void>
}

export const authApiService: AuthApiService = {
  async login(credentials: LoginForm) {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
    
    try {
      const res = await api.post(`${apiUrl}/users/login`, {
        email: credentials.email,
        password: credentials.password
      }, {
        headers: getApiHeaders(apiUrl)
      });
      return res.data as LoginResponse;
    } catch (error: any) {
      const msg = error?.response?.data?.detail || error?.response?.data?.message || error?.message || 'Login failed';
      if (error?.response?.status === 401) {
        throw new Error('Invalid email or password');
      }
      throw new Error(msg);
    }
  },

  async register(userData: RegisterForm) {
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:5000'
    
    // Validate password confirmation on frontend
    if (userData.password !== userData.confirmPassword) {
      throw new Error('Passwords do not match')
    }
    
    try {
      const res = await api.post(`${apiUrl}/users`, {
        email: userData.email,
        password: userData.password,
        fullName: userData.name // Map 'name' to 'fullName' as expected by API
      }, {
        headers: getApiHeaders(apiUrl)
      });
      return res.data as RegisterResponse;
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Registration failed';
      throw new Error(msg);
    }
  },

  async logout() {
    // For stateless JWT, we just need to remove the token from client
    // In a more complex setup, you might want to call a logout endpoint
    return Promise.resolve()
  }
}

export default authApiService
