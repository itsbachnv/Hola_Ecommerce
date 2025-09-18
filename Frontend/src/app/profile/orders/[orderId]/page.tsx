"use client";
import OrderDetailPage from '@/components/orders/OrderDetailPage';
import { useParams } from 'next/navigation';

export default function ProfileOrderDetailPage() {
  const params = useParams();
  // Map orderId param to orderCode prop
  const orderCode = params.orderId as string;
  return <OrderDetailPage orderCode={orderCode} />;
}
