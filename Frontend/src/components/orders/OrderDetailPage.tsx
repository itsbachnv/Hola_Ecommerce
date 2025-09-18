
"use client";

import { useEffect, useState } from "react";
import { useUserOrders } from "@/hooks/useUserOrders";

type OrderDetail = {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  shippingFee: number;
  discountTotal: number;
  createdAt: string;
  shippingAddress: {
    address: string;
    ward?: string;
    district?: string;
    city?: string;
    postalCode?: string;
  };
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    variantId?: string;
    variantName?: string;
    variantSku?: string;
    variantAttributes?: Record<string, string>;
  }>;
  paymentMethod: string;
  logs: Array<{
    time: string;
    status: string;
    note: string;
  }>;
};

const statusVN: Record<string, string> = {
  Ordered: 'Đã đặt',
  AwaitingFulfillment: 'Chờ xử lý',
  Shipped: 'Đang giao',
  Delivered: 'Đã giao',
  Completed: 'Hoàn tất',
  Cancelled: 'Đã hủy',
  PaymentReceived: 'Đã nhận tiền',
  Refunded: 'Đã hoàn tiền',
};

interface OrderDetailPageProps {
  orderCode: string;
}

export default function OrderDetailPage({ orderCode }: OrderDetailPageProps) {
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { getOrderByCode } = useUserOrders();

  useEffect(() => {
    if (!orderCode) return;
    setLoading(true);
    setError(null);
    getOrderByCode(orderCode)
      .then((data) => {
        if (!data) throw new Error("Không tìm thấy đơn hàng");
        let addressObj: any = {};
        if (typeof data.ShippingAddress?.Address === "string") {
          try {
            addressObj = JSON.parse(data.ShippingAddress.Address);
          } catch {
            addressObj = { Address: data.ShippingAddress.Address };
          }
        }
        const mapped: OrderDetail = {
          id: String(data.Id),
          orderNumber: data.OrderNumber,
          status: statusVN[data.Status] || data.Status,
          total: data.Total,
          shippingFee: data.ShippingFee || 0,
          discountTotal: data.DiscountTotal || 0,
          createdAt: data.CreatedAt,
          shippingAddress: {
            address: addressObj.Address || "",
            ward: addressObj.Ward || "",
            district: addressObj.District || "",
            city: addressObj.City || "",
            postalCode: addressObj.PostalCode || "",
          },
          items: (data.Items || []).map((item: any) => {
            let variantAttributes: Record<string, string> = {};
            if (item.VariantAttributes) {
              try {
                variantAttributes = JSON.parse(item.VariantAttributes);
              } catch {}
            }
            return {
              id: String(item.Id),
              name: item.Name,
              price: item.Price,
              quantity: item.Quantity,
              image: item.Image,
              variantId: item.VariantId ? String(item.VariantId) : undefined,
              variantName: item.VariantName,
              variantSku: item.VariantSku,
              variantAttributes,
            };
          }),
          paymentMethod: data.PaymentMethod || "",
          logs: (data.Logs || []).map((log: any) => ({
            time: log.Time || "",
            status: log.Status || "",
            note: log.Note || "",
          })),
        };
        setOrder(mapped);
      })
      .catch((err) => {
        setError(err.message || "Lỗi khi tải đơn hàng");
        setOrder(null);
      })
      .finally(() => setLoading(false));
  }, [orderCode, getOrderByCode]);

  if (loading) return <div className="text-center py-10">Đang tải đơn hàng...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;
  if (!order) return <div className="text-center py-10">Không tìm thấy đơn hàng.</div>;

  const steps = ["Đã đặt", "Giao hàng", "Trả hàng", "Đánh giá"];
  const activeIndex = steps.findIndex((s) => order.status.includes(s));

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="bg-white shadow-md rounded-2xl p-6 flex justify-between items-center">
        <div>
          <p className="text-gray-600 text-sm">
            Mã đơn hàng:{" "}
            <span className="font-semibold">{order.orderNumber}</span>
          </p>
          <p className="text-orange-500 font-semibold mt-1">{order.status}</p>
        </div>
        <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleString("vi-VN")}</div>
      </div>

      {/* Timeline */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <div className="flex justify-between relative">
          <div className="absolute top-5 left-[10%] right-[10%] h-[3px] bg-gray-200 z-0" />
          <div
            className="absolute top-5 left-[10%] h-[3px] bg-green-500 z-10 transition-all"
            style={{ width: `${(activeIndex / (steps.length - 1)) * 80}%` }}
          />
          {steps.map((step, index) => (
            <div key={index} className="flex flex-col items-center z-20 w-1/5">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full border-2 font-bold mb-2
                  ${
                    index <= activeIndex
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-400 border-gray-300"
                  }`}
              >
                {index + 1}
              </div>
              <p
                className={`text-[11px] sm:text-xs text-center ${
                  index <= activeIndex ? "text-green-600" : "text-gray-400"
                }`}
              >
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Địa chỉ nhận hàng */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="font-semibold mb-3">📍 Địa chỉ nhận hàng</h2>
        <div className="text-sm text-gray-700 space-y-1">
          <p><span className="font-medium">Địa chỉ:</span> {order.shippingAddress.address}</p>
          {order.shippingAddress.ward && <p><span className="font-medium">Phường/Xã:</span> {order.shippingAddress.ward}</p>}
          {order.shippingAddress.district && <p><span className="font-medium">Quận/Huyện:</span> {order.shippingAddress.district}</p>}
          {order.shippingAddress.city && <p><span className="font-medium">Tỉnh/Thành phố:</span> {order.shippingAddress.city}</p>}
          {order.shippingAddress.postalCode && <p><span className="font-medium">Mã bưu điện:</span> {order.shippingAddress.postalCode}</p>}
        </div>
      </div>

      {/* Sản phẩm */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="font-semibold mb-4 text-orange-500">🛒 Sản phẩm</h2>
        <div className="divide-y">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-4">
              <div className="flex gap-3">
                <img src={item.image} alt={item.name} className="w-16 h-16 border rounded-lg object-cover" />
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  {item.variantName && <p className="text-xs text-gray-500">Phân loại: {item.variantName}</p>}
                  {item.variantSku && <p className="text-xs text-gray-500">SKU: {item.variantSku}</p>}
                  {item.variantAttributes && Object.keys(item.variantAttributes).length > 0 && (
                    <p className="text-xs text-gray-500">
                      {Object.entries(item.variantAttributes)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(", ")}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">x{item.quantity}</p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-800 min-w-[90px] text-right">
                {item.price.toLocaleString("vi-VN")}₫
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Thanh toán */}
      <div className="bg-white shadow-md rounded-2xl p-6 text-sm">
        <div className="flex justify-between py-1">
          <span>Tổng tiền hàng</span>
          <span>{order.total.toLocaleString("vi-VN")}₫</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Phí vận chuyển</span>
          <span>{order.shippingFee.toLocaleString("vi-VN")}₫</span>
        </div>
        <div className="flex justify-between py-1">
          <span>Giảm giá</span>
          <span>-{order.discountTotal.toLocaleString("vi-VN")}₫</span>
        </div>
        <div className="flex justify-between py-2 border-t mt-2 font-semibold text-orange-600 text-base">
          <span>Thành tiền</span>
          <span>{order.total.toLocaleString("vi-VN")}₫</span>
        </div>
        <div className="flex justify-between py-1 border-t mt-2">
          <span>Phương thức Thanh toán</span>
          <span className="text-green-600 font-medium">{order.paymentMethod}</span>
        </div>
      </div>

      {/* Nhật ký giao hàng */}
      <div className="bg-white shadow-md rounded-2xl p-6">
        <h2 className="font-semibold mb-3">📦 Lịch sử giao hàng</h2>
        <ul className="space-y-3 text-sm">
          {order.logs.map((log, i) => (
            <li key={i} className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-800">
                {log.time} - <span className="text-blue-600 font-medium">{log.status}</span>
              </p>
              <p className="text-gray-500 text-xs">{log.note}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
