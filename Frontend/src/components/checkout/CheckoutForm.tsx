'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
// import { useRouter } from 'next/navigation';
import { useCheckout } from '@/hooks/useCheckout';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import Button from '@/components/ui/Button';
import { getProvinces, getDistricts, getWards, Province, District } from '@/components/Address/provinces_districts';
import LoadingButton from '@/components/ui/LoadingButton';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

// Prop type cho danh sách sản phẩm đã chọn
interface CheckoutFormProps {
  // TODO: Replace any with proper type for items
  items: any[];
}

interface CheckoutFormData {
  // Shipping Information
  fullName: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  city: string;
  ward: string; // Thêm trường xã/phường
  postalCode?: string;
  
  // Payment Information
  paymentMethod: 'cod' | 'bank_transfer' | 'momo' | 'vnpay';
  
  // Account creation (for guests)
  createAccount?: boolean;
  password?: string;
  confirmPassword?: string;
  
  // Additional
  notes?: string;
  voucherCode?: string;
}

export default function CheckoutForm({ items }: CheckoutFormProps) {
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const provinces: Province[] = getProvinces();
  const districts: District[] = selectedProvince ? getDistricts(selectedProvince) : [];
  const wards: { code: string; name: string }[] = (selectedProvince && selectedDistrict) ? getWards(selectedProvince, selectedDistrict) : [];
  // const router = useRouter();
  const { cart } = useCartStore();
  const { user } = useAuthStore();
  const [voucherCode, setVoucherCode] = useState('');
  const [voucherApplied, setVoucherApplied] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const { checkout, isSubmitting } = useCheckout();
  // Danh sách mã giảm giá nổi bật
  const featuredVouchers = [
    { code: 'HOLAVIP', label: 'Giảm 10% cho khách VIP' },
    { code: 'FREESHIP', label: 'Miễn phí vận chuyển' },
    { code: 'SALE50', label: 'Giảm 50k cho đơn từ 500k' },
  ];

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CheckoutFormData>({
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      paymentMethod: 'cod',
    },
  });

  const selectedPaymentMethod = watch('paymentMethod');

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cart || cart.items.length === 0) {
      // showToast đã nằm trong hook
      return;
    }
    // Validate password nếu tạo tài khoản
    if (!user && data.createAccount) {
      if (!data.password || !data.confirmPassword) {
        // showToast đã nằm trong hook
        return;
      }
      if (data.password !== data.confirmPassword) {
        // showToast đã nằm trong hook
        return;
      }
    }
    const subtotal = items.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
    const shippingFee = 30000;
    const total = subtotal + shippingFee;
    const orderData = {
      customerInfo: {
        userId : user?.id,
        fullName: data.fullName,
        phone: data.phone,
        email: data.email,
        isGuest: !user,
        createAccount: !user && data.createAccount,
        password: !user && data.createAccount ? data.password : undefined,
      },
      shippingAddress: {
        address: data.address,
        ward: data.ward,
        district: data.district,
        city: data.city,
        postalCode: data.postalCode || '',
      },
      items: items.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.variant.price,
      })),
      paymentMethod: data.paymentMethod,
      notes: data.notes || '',
      voucherCode: voucherApplied ? voucherCode : '',
      subtotal,
      shippingFee,
      total,
    };
    checkout(orderData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* User Status */}
      {user ? (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Xin chào, {user.fullName}!
                </h2>
                <p className="text-sm text-gray-600">
                  Đặt hàng với tài khoản: {user.email}
                </p>
              </div>
              <div className="text-green-600">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Đặt hàng dưới dạng khách
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Bạn đang đặt hàng mà không cần tạo tài khoản. Để theo dõi đơn hàng dễ dàng hơn, hãy{' '}
              <a href="/auth/login?redirect=/checkout" className="text-blue-600 underline font-medium">
                đăng nhập
              </a>
              {' '}hoặc{' '}
              <a href="/auth/register?redirect=/checkout" className="text-blue-600 underline font-medium">
                tạo tài khoản
              </a>
              .
            </p>
          </CardContent>
        </Card>
      )}

      {/* Shipping Information */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Thông tin giao hàng</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên *
              </label>
              <Input
                {...register('fullName', { 
                  required: 'Vui lòng nhập họ và tên' 
                })}
                placeholder="Nhập họ và tên"
                className={errors.fullName ? 'border-red-500' : ''}
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại *
              </label>
              <Input
                {...register('phone', { 
                  required: 'Vui lòng nhập số điện thoại',
                  pattern: {
                    value: /^[0-9]{10,11}$/,
                    message: 'Số điện thoại không hợp lệ'
                  }
                })}
                placeholder="Nhập số điện thoại"
                className={errors.phone ? 'border-red-500' : ''}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                {...register('email', { 
                  required: 'Vui lòng nhập email',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email không hợp lệ'
                  }
                })}
                placeholder="Nhập email"
                className={errors.email ? 'border-red-500' : ''}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố *</label>
              <select
                value={selectedProvince}
                onChange={e => {
                  setSelectedProvince(e.target.value);
                  setSelectedDistrict('');
                  setSelectedWard('');
                  const province = provinces.find(p => p.code === e.target.value);
                  setValue('city', province ? province.name : '', { shouldValidate: true });
                }}
                className="w-full border rounded p-2 mb-4"
              >
                <option value="">Chọn tỉnh/thành phố</option>
                {provinces.map(p => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
              {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}

              <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện *</label>
              <select
                value={selectedDistrict}
                onChange={e => {
                  setSelectedDistrict(e.target.value);
                  setSelectedWard('');
                  const district = districts.find(d => d.code === e.target.value);
                  setValue('district', district ? district.name : '', { shouldValidate: true });
                  setValue('ward', '', { shouldValidate: true });
                }}
                className="w-full border rounded p-2 mb-4"
                disabled={!selectedProvince}
              >
                <option value="">Chọn quận/huyện</option>
                {districts.map(d => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
              {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>}

              <label className="block text-sm font-medium text-gray-700 mb-1">Xã/Phường *</label>
              <select
                value={selectedWard}
                onChange={e => {
                  setSelectedWard(e.target.value);
                  const ward = wards.find(w => w.code === e.target.value);
                  setValue('ward', ward ? ward.name : '', { shouldValidate: true });
                }}
                className="w-full border rounded p-2 mb-4"
                disabled={!selectedDistrict || wards.length === 0}
              >
                <option value="">Chọn xã/phường</option>
                {wards.map(w => (
                  <option key={w.code} value={w.code}>{w.name}</option>
                ))}
              </select>
              {errors.ward && <p className="mt-1 text-sm text-red-600">{errors.ward.message}</p>}

              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết *</label>
              <input
                {...register('address', { required: 'Vui lòng nhập địa chỉ chi tiết' })}
                placeholder="Số nhà, tên đường..."
                className={`w-full border rounded p-2 ${errors.address ? 'border-red-500' : ''}`}
              />
              {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Creation Option (only for guests) */}
      {!user && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                id="createAccount"
                {...register('createAccount')}
                className="rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="createAccount" className="text-sm font-medium text-gray-900 cursor-pointer">
                Tạo tài khoản để theo dõi đơn hàng
              </label>
            </div>

            {watch('createAccount') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu *
                  </label>
                  <Input
                    type="password"
                    {...register('password', { 
                      required: watch('createAccount') ? 'Vui lòng nhập mật khẩu' : false,
                      minLength: {
                        value: 6,
                        message: 'Mật khẩu phải có ít nhất 6 ký tự'
                      }
                    })}
                    placeholder="Nhập mật khẩu"
                    className={errors.password ? 'border-red-500' : ''}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xác nhận mật khẩu *
                  </label>
                  <Input
                    type="password"
                    {...register('confirmPassword', {
                      required: watch('createAccount') ? 'Vui lòng xác nhận mật khẩu' : false,
                      validate: (value) => {
                        if (watch('createAccount') && value !== watch('password')) {
                          return 'Mật khẩu không khớp';
                        }
                        return true;
                      }
                    })}
                    placeholder="Xác nhận mật khẩu"
                    className={errors.confirmPassword ? 'border-red-500' : ''}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Voucher Code - UI đẹp, chọn nhanh */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Mã giảm giá</h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {featuredVouchers.map(v => (
              <button
                key={v.code}
                type="button"
                className={`px-3 py-2 rounded-lg border font-medium shadow-sm transition-all duration-150 hover:bg-black hover:text-white ${voucherCode.toUpperCase() === v.code ? 'bg-black text-white' : 'bg-gray-100 text-black'}`}
                onClick={() => {
                  setVoucherCode(v.code);
                  setVoucherError('');
                  setVoucherApplied(false);
                }}
              >
                {v.code} <span className="ml-1 text-xs text-gray-500">{v.label}</span>
              </button>
            ))}
          </div>
          <div className="flex gap-2 items-center">
            <Input
              value={voucherCode}
              onChange={e => {
                setVoucherCode(e.target.value);
                setVoucherError('');
                setVoucherApplied(false);
              }}
              placeholder="Nhập mã giảm giá hoặc chọn bên trên"
              className="w-1/2"
            />
            <Button
              type="button"
              onClick={() => {
                if (!voucherCode) {
                  setVoucherError('Vui lòng nhập mã giảm giá');
                  setVoucherApplied(false);
                  return;
                }
                // Giả lập kiểm tra mã, thực tế sẽ gọi API kiểm tra
                const validCodes = featuredVouchers.map(v => v.code.toLowerCase());
                if (validCodes.includes(voucherCode.trim().toLowerCase())) {
                  setVoucherApplied(true);
                  setVoucherError('');
                  // showToast('Áp dụng mã giảm giá thành công!', 'success');
                } else {
                  setVoucherApplied(false);
                  setVoucherError('Mã giảm giá không hợp lệ');
                  // showToast('Mã giảm giá không hợp lệ', 'error');
                }
              }}
              className="ml-2"
            >
              Áp dụng
            </Button>
          </div>
          {voucherError && <p className="mt-2 text-sm text-red-600">{voucherError}</p>}
          {voucherApplied && <p className="mt-2 text-sm text-green-600">Mã giảm giá đã được áp dụng!</p>}
        </CardContent>
      </Card>
      {/* Payment Method */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Phương thức thanh toán</h2>
          
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                {...register('paymentMethod')}
                value="cod"
                className="text-black focus:ring-black"
              />
              <div className="flex-1">
                <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                <div className="text-sm text-gray-500">Trả tiền mặt khi nhận hàng</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                {...register('paymentMethod')}
                value="bank_transfer"
                className="text-black focus:ring-black"
              />
              <div className="flex-1">
                <div className="font-medium">Chuyển khoản ngân hàng</div>
                <div className="text-sm text-gray-500">Chuyển khoản trước khi giao hàng</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                {...register('paymentMethod')}
                value="momo"
                className="text-black focus:ring-black"
              />
              <div className="flex-1">
                <div className="font-medium">Ví MoMo</div>
                <div className="text-sm text-gray-500">Thanh toán qua ví điện tử MoMo</div>
              </div>
            </label>

            <label className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                {...register('paymentMethod')}
                value="vnpay"
                className="text-black focus:ring-black"
              />
              <div className="flex-1">
                <div className="font-medium">VNPay</div>
                <div className="text-sm text-gray-500">Thanh toán qua cổng VNPay</div>
              </div>
            </label>
          </div>

          {selectedPaymentMethod === 'bank_transfer' && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Thông tin chuyển khoản:</h3>
              <div className="text-sm text-blue-800">
                <p><strong>Ngân hàng:</strong> Vietcombank</p>
                <p><strong>Số tài khoản:</strong> 1234567890</p>
                <p><strong>Chủ tài khoản:</strong> CÔNG TY HOLA ECOMMERCE</p>
                <p><strong>Nội dung:</strong> Thanh toan don hang [Mã đơn hàng]</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Ghi chú đơn hàng</h2>
          
          <textarea
            {...register('notes')}
            placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="sticky bottom-0 bg-white p-4 border-t">
        <LoadingButton
          type="submit"
          loading={isSubmitting}
          loadingText={!user && watch('createAccount') ? 'Đang tạo tài khoản và đặt hàng...' : 'Đang xử lý đơn hàng...'}
          className="w-full"
          size="lg"
        >
          Đặt hàng ngay
        </LoadingButton>
      </div>
    </form>
  );
}
