"use client";
import { useUserOrders, UserOrder } from '@/hooks/useUserOrders';
import OrderManagement from '@/components/admin/OrderManagement';
import { useMemo } from 'react';
import { Order } from '@/types';

// Helper: map UserOrder (API) -> Order (admin UI)
function mapUserOrderToOrder(uo: UserOrder): Order {
  return {
    id: uo.Id,
    code: uo.OrderNumber,
    userId: undefined, // Nếu có userId thì map vào đây
    status: uo.Status,
    subtotal: uo.Total, // Nếu có field riêng thì map lại
    discountTotal: uo.DiscountTotal || 0,
    shippingFee: uo.ShippingFee || 0,
    taxTotal: 0,
    grandTotal: uo.Total,
    voucherCode: undefined,
    shippingAddress: uo.ShippingAddress,
    billingAddress: undefined,
    notes: '',
    createdAt: uo.CreatedAt,
    paidAt: undefined,
    shippedAt: undefined,
    deliveredAt: undefined,
    cancelledAt: undefined,
    user: {
      id: 0,
      fullName: '',
      email: '',
      isActive: true,
      createdAt: '',
      updatedAt: '',
    },
    items: (uo.Items || []).map(item => ({
      id: item.Id,
      orderId: uo.Id,
      productId: 0,
      variantId: undefined,
      quantity: item.Quantity,
      unitPrice: item.Price,
      totalPrice: item.Price * item.Quantity,
      product: { id: 0, name: item.Name, slug: '', status: '', createdAt: '', updatedAt: '', variants: [], images: [] },
    })),
    payments: [],
    shipments: [],
  };
}

export default function AdminOrdersContainer() {
  const { orders, loading, refetch } = useUserOrders();

  // Nhóm đơn hàng theo email khách hàng (nếu có)
  const grouped = useMemo(() => {
    const groups: Record<string, Order[]> = {};
    for (const uo of orders) {
      const order = mapUserOrderToOrder(uo);
      const email = uo.ShippingAddress?.Address || 'Khách vãng lai';
      if (!groups[email]) groups[email] = [];
      groups[email].push(order);
    }
    return groups;
  }, [orders]);

  // Flatten để truyền cho OrderManagement (có thể custom lại UI để group)
  const flatOrders: Order[] = orders.map(mapUserOrderToOrder);

  // Dummy handlers (cần implement API update thực tế)
  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    // TODO: call API update status
    refetch();
  };
  const handleUpdateTracking = (orderId: string, trackingNumber: string) => {
    // TODO: call API update tracking
    refetch();
  };
  const handleCancelOrder = (orderId: string) => {
    // TODO: call API cancel order
    refetch();
  };

  return (
    <OrderManagement
      orders={flatOrders}
      onUpdateOrderStatus={handleUpdateOrderStatus}
      onUpdateTracking={handleUpdateTracking}
      onCancelOrder={handleCancelOrder}
      isLoading={loading}
    />
  );
}
