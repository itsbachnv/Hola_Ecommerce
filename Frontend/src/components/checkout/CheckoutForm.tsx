'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cart';
import { useAuthStore } from '@/stores/auth';
import { useToastStore } from '@/stores/toast';
import { useLoadingStore } from '@/stores/loading';
import Button from '@/components/ui/Button';
import LoadingButton from '@/components/ui/LoadingButton';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';

interface CheckoutFormData {
  // Shipping Information
  fullName: string;
  phone: string;
  email: string;
  address: string;
  district: string;
  city: string;
  postalCode?: string;
  
  // Payment Information
  paymentMethod: 'cod' | 'bank_transfer' | 'momo' | 'vnpay';
  
  // Account creation (for guests)
  createAccount?: boolean;
  password?: string;
  confirmPassword?: string;
  
  // Additional
  notes?: string;
}

export default function CheckoutForm() {
  const router = useRouter();
  const { cart, clearCart } = useCartStore();
  const { user, setUser, setToken } = useAuthStore();
  const { showToast } = useToastStore();
  const { setLoading, clearLoading } = useLoadingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
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
      showToast('Giỏ hàng trống', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      // Set loading with appropriate message
      if (!user && data.createAccount) {
        setLoading(true, 'Đang tạo tài khoản và đặt hàng...', 'creating');
      } else {
        setLoading(true, 'Đang xử lý đơn hàng...', 'creating');
      }

      // If guest wants to create account, validate password fields
      if (!user && data.createAccount) {
        if (!data.password || !data.confirmPassword) {
          showToast('Vui lòng nhập đầy đủ thông tin mật khẩu', 'error');
          return;
        }
        if (data.password !== data.confirmPassword) {
          showToast('Mật khẩu không khớp', 'error');
          return;
        }
      }

      // Update loading message
      setLoading(true, 'Đang chuẩn bị thông tin đơn hàng...', 'saving');

      // Prepare order data
      const orderData = {
        // Customer info
        customerInfo: {
          fullName: data.fullName,
          phone: data.phone,
          email: data.email,
          isGuest: !user,
          createAccount: !user && data.createAccount,
          password: !user && data.createAccount ? data.password : undefined,
        },
        
        // Shipping info
        shippingAddress: {
          address: data.address,
          district: data.district,
          city: data.city,
          postalCode: data.postalCode || '',
        },
        
        // Order items
        items: cart.items.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.variant.price,
        })),
        
        // Payment
        paymentMethod: data.paymentMethod,
        
        // Additional
        notes: data.notes || '',
        
        // Totals
        subtotal: cart.total,
        shippingFee: 30000, // 30k VND shipping fee
        total: cart.total + 30000,
      };

      console.log('Submitting order:', orderData);

      // Update loading message for API call
      setLoading(true, 'Đang gửi đơn hàng đến server...', 'updating');

      // Here you would call your API to create the order
      // If createAccount is true, the API should:
      // 1. Create user account
      // 2. Create order linked to new account
      // 3. Return order details + login token
      
      // const response = await createOrder(orderData);
      // if (response.token) {
      //   // Auto login the newly created user
      //   setToken(response.token);
      //   setUser(response.user);
      // }

      // Simulate API call with realistic timing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update loading for final steps
      setLoading(true, 'Đang hoàn tất đơn hàng...', 'saving');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Clear cart and redirect to success
      clearCart();
      
      if (!user && data.createAccount) {
        showToast('Tài khoản đã được tạo và đơn hàng đã được đặt thành công!', 'success');
      } else {
        showToast('Đặt hàng thành công!', 'success');
      }
      
      router.push('/order-success');

    } catch (error) {
      console.error('Checkout error:', error);
      showToast('Có lỗi xảy ra khi đặt hàng', 'error');
    } finally {
      setIsSubmitting(false);
      clearLoading();
    }
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ *
              </label>
              <Input
                {...register('address', { 
                  required: 'Vui lòng nhập địa chỉ' 
                })}
                placeholder="Số nhà, tên đường"
                className={errors.address ? 'border-red-500' : ''}
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quận/Huyện *
              </label>
              <Input
                {...register('district', { 
                  required: 'Vui lòng nhập quận/huyện' 
                })}
                placeholder="Quận/Huyện"
                className={errors.district ? 'border-red-500' : ''}
              />
              {errors.district && (
                <p className="mt-1 text-sm text-red-600">{errors.district.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tỉnh/Thành phố *
              </label>
              <Input
                {...register('city', { 
                  required: 'Vui lòng nhập tỉnh/thành phố' 
                })}
                placeholder="Tỉnh/Thành phố"
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>
              )}
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
