// Helper: build headers for ngrok and auth (copy from useProducts)
function getApiHeaders(apiUrl: string, extra?: Record<string, string>): Record<string, string> {
  const headers: Record<string, string> = extra ? { ...extra } : {};
  if (apiUrl.includes('.ngrok-free.app')) {
    headers['ngrok-skip-browser-warning'] = 'true';
  }
  return headers;
}

import { useAuthStore } from '@/stores/auth';

// Helper function to get authenticated headers (for axios)
function getAuthHeaders(apiUrl: string): Record<string, string> {
  const token = useAuthStore.getState().token;
  const base: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  return getApiHeaders(apiUrl, base);
}

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/utils/api';

// Lấy base URL từ biến môi trường
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';
import { useToastStore } from '@/stores/toast';
import { useLoadingStore } from '@/stores/loading';

export interface CheckoutPayload {
  customerInfo: any;
  shippingAddress: any;
  items: any[];
  paymentMethod: string;
  notes?: string;
  voucherCode?: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  password?: string;
}

export function useCheckout() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { showToast } = useToastStore();
  const { setLoading, clearLoading } = useLoadingStore();

  const checkout = async (payload: CheckoutPayload, options?: { onSuccess?: () => void; onError?: () => void }) => {
    setIsSubmitting(true);
    setLoading(true, 'Đang xử lý đơn hàng...', 'creating');
    try {
  // Gọi API đặt hàng với baseURL từ env
    const apiUrl = `${API_BASE_URL}/api/orders/checkout`;
    const response = await api.post(apiUrl, payload, {
      headers: getAuthHeaders(apiUrl)
    });
      setLoading(true, 'Đang gửi đơn hàng đến server...', 'updating');
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(true, 'Đang hoàn tất đơn hàng...', 'saving');
      await new Promise(resolve => setTimeout(resolve, 500));
      if (
        (response.data && response.data.success) ||
        (response.data && response.data.Message && typeof response.data.Message === 'string')
      ) {
        // Nếu có message từ backend thì show message đó, không thì show mặc định
        const msg = response.data.Message || 'Đặt hàng thành công!';
        showToast(msg, 'success');
        if (options?.onSuccess) options.onSuccess();
        router.push('/order-success');
      } else {
        showToast('Có lỗi xảy ra khi đặt hàng', 'error');
        if (options?.onError) options.onError();
      }
    } catch (err) {
      showToast('Có lỗi xảy ra khi đặt hàng', 'error');
      if (options?.onError) options.onError();
    } finally {
      setIsSubmitting(false);
      clearLoading();
    }
  };

  return { checkout, isSubmitting };
}
