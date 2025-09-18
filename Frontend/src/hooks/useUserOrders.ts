import { useState, useEffect, useCallback } from "react";
import api from "@/utils/api";
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

export interface ShippingAddress {
  Address: string | null;
  Ward: string | null;
  District: string | null;
  City: string | null;
  PostalCode: string | null;
}

export interface UserOrderItem {
  Id: number;
  Name: string;
  Price: number;
  Quantity: number;
  Image: string;
}

export interface OrderLog {
  Time: string;
  Status: string;
  Note: string;
}

export interface UserOrder {
  Id: number;
  OrderNumber: string;
  Status: string;
  Total: number;
  ShippingFee?: number;
  DiscountTotal?: number;
  CreatedAt: string;
  ShippingAddress: ShippingAddress;
  Items: UserOrderItem[];
  PaymentMethod: string;
  Logs: OrderLog[];
}


export function useUserOrders() {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders`
        : "http://localhost:5000/api/orders";
      const res = await api.get(apiUrl, {
        headers: getAuthHeaders(apiUrl)
      });
      setOrders(res.data);
    } catch (err: any) {
      setError("Không thể tải danh sách đơn hàng");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // New: fetch order by order code
  const getOrderByCode = useCallback(async (orderCode: string): Promise<UserOrder | null> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL
        ? `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/orders/${orderCode}`
        : `http://localhost:5000/api/orders/${orderCode}`;
      const res = await api.get(apiUrl, {
        headers: getAuthHeaders(apiUrl)
      });
      return res.data;
    } catch (err) {
      return null;
    }
  }, []);

  return { orders, loading, error, refetch: fetchOrders, getOrderByCode };
}