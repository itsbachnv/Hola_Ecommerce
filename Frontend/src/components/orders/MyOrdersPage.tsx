
"use client";

import { useRouter } from "next/navigation";
import { useUserOrders } from "@/hooks/useUserOrders";

export default function MyOrdersPage() {
  const { orders, loading, error, refetch } = useUserOrders();
  const router = useRouter();
function OrderSummaryHeader({ order }: { order: any }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 pb-2 border-b border-gray-100">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <span className="text-xs text-gray-500">Mã đơn:</span>
        <span className="font-semibold text-sm">{order.OrderNumber}</span>
        <span className="mx-2 hidden sm:inline text-gray-300">|</span>
        <span className="text-xs text-gray-500">Trạng thái:</span>
        <span className="text-orange-600 font-semibold text-xs">{order.Status}</span>
        <span className="mx-2 hidden sm:inline text-gray-300">|</span>
        <span className="text-xs text-gray-500">Ngày đặt:</span>
        <span className="text-xs">{new Date(order.CreatedAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit', second: '2-digit' })} {new Date(order.CreatedAt).toLocaleDateString("vi-VN")}</span>
      </div>
    </div>
  );
}
  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Đơn hàng của tôi</h1>
      {loading ? (
        <div>Đang tải đơn hàng...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.Id}
              className="bg-white shadow rounded-lg p-4 border border-gray-200"
            >
              <OrderSummaryHeader order={order} />
              {/* Danh sách sản phẩm trong đơn */}
              {order.Items && order.Items.length > 0 && (
                <div className="divide-y">
                  {order.Items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 py-2">
                      <img
                        src={item.ImageUrl}
                        alt={item.Name}
                        className="w-16 h-16 rounded border object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800">{item.ProductName}</p>
                        <p className="text-xs text-gray-500">x{item.Quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-800">{item.Price.toLocaleString("vi-VN")}₫</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* Footer */}
              <div className="mt-3 text-sm text-gray-600 flex justify-between items-center">
                <div></div>
                <div className="text-right">
                  <p className="font-bold text-lg text-orange-600">{order.Total.toLocaleString("vi-VN")}₫</p>
                  {order.Refund > 0 && (
                    <p className="text-green-600">Hoàn lại: {order.Refund.toLocaleString("vi-VN")}₫</p>
                  )}
                  <button
                    onClick={() => router.push(`/profile/orders/${order.OrderNumber}`)}
                    className="text-blue-600 hover:underline text-sm mt-2"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
