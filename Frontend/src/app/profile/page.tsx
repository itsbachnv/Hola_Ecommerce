"use client";
import { useAuth } from '@/stores/auth';

export default function ProfileInfoPage() {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Thông tin cá nhân</h3>
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Họ tên</label>
              <div className="mt-1 text-sm text-gray-900">{user.fullName || 'Chưa cập nhật'}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <div className="mt-1 text-sm text-gray-900">{user.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Vai trò</label>
              <div className="mt-1 text-sm text-gray-900 capitalize">{user.role}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Trạng thái</label>
              <div className="mt-1">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? 'Đang hoạt động' : 'Ngưng hoạt động'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Thành viên từ</label>
              <div className="mt-1 text-sm text-gray-900">
                {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
          <div className="mt-6">
            <button
              type="button"
              className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            >
              Chỉnh sửa thông tin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
