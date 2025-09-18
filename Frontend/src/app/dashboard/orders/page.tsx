'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/stores/auth';
import AdminLayout from '@/components/layout/AdminLayout';
import dynamic from 'next/dynamic';

const AdminOrdersContainer = dynamic(() => import('@/app/admin/orders/AdminOrdersContainer'), { ssr: false });

export default function OrdersManagementPage() {
  const { isAuthenticated, isAdmin, isStaff, isInitialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isAdmin && !isStaff) {
      router.push('/');
      return;
    }
  }, [isInitialized, isAuthenticated, isAdmin, isStaff, router]);

  if (!isInitialized || !isAuthenticated || (!isAdmin && !isStaff)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Quản Lý Đơn Hàng</h1>
              <p className="text-gray-600 mt-1">
                Quản lý danh sách đơn hàng, theo dõi và xử lý đơn hàng của khách
              </p>
            </div>
          </div>
          <AdminOrdersContainer />
        </div>
      </AdminLayout>
    </div>
  );
}
