'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { CheckoutForm } from '@/types'
import { formatPrice } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Button from '@/components/ui/Button'
import { useCartStore } from '@/stores/cart'
import { CreditCard, Smartphone, DollarSign } from 'lucide-react'

interface CheckoutProps {
  onOrderSubmit: (orderData: CheckoutForm) => void
  isLoading?: boolean
}

export default function Checkout({ onOrderSubmit, isLoading = false }: CheckoutProps) {
  const { cart, getTotal, getItemCount } = useCartStore()
  const [step, setStep] = useState<'shipping' | 'payment' | 'review'>('shipping')
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<CheckoutForm>({
    defaultValues: {
      paymentMethod: 'MoMo'
    }
  })

  const watchedPaymentMethod = watch('paymentMethod')
  const total = getTotal()
  const itemCount = getItemCount()
  const shipping = total > 500000 ? 0 : 30000 // Free shipping over 500k
  const tax = Math.round(total * 0.1) // 10% VAT
  const finalTotal = total + shipping + tax

  const onSubmit = (data: CheckoutForm) => {
    if (step === 'shipping') {
      setStep('payment')
    } else if (step === 'payment') {
      setStep('review')
    } else {
      onOrderSubmit(data)
    }
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some products before checkout</p>
        <Button onClick={() => window.history.back()}>
          Continue Shopping
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {['shipping', 'payment', 'review'].map((stepName, index) => (
            <div key={stepName} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${step === stepName || ['shipping', 'payment', 'review'].indexOf(step) > index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {index + 1}
              </div>
              <span className="ml-2 text-sm font-medium capitalize text-gray-700">
                {stepName}
              </span>
              {index < 2 && (
                <div className={`
                  w-16 h-0.5 mx-4
                  ${['shipping', 'payment', 'review'].indexOf(step) > index
                    ? 'bg-blue-600'
                    : 'bg-gray-200'
                  }
                `} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 'shipping' && (
              <ShippingStep register={register} errors={errors} />
            )}
            
            {step === 'payment' && (
              <PaymentStep 
                register={register} 
                errors={errors} 
                watchedPaymentMethod={watchedPaymentMethod}
                setValue={setValue}
              />
            )}
            
            {step === 'review' && (
              <ReviewStep 
                watch={watch}
                cart={cart}
              />
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              cart={cart}
              total={total}
              shipping={shipping}
              tax={tax}
              finalTotal={finalTotal}
              itemCount={itemCount}
            />

            {/* Navigation Buttons */}
            <div className="mt-6 space-y-3">
              <Button
                type="submit"
                fullWidth
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 
                 step === 'shipping' ? 'Continue to Payment' :
                 step === 'payment' ? 'Review Order' :
                 'Place Order'}
              </Button>
              
              {step !== 'shipping' && (
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={() => {
                    if (step === 'review') setStep('payment')
                    else if (step === 'payment') setStep('shipping')
                  }}
                >
                  Back
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

function ShippingStep({ register, errors }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              {...register('shippingAddress.fullName', { required: 'Full name is required' })}
              placeholder="Enter your full name"
            />
            {errors?.shippingAddress?.fullName && (
              <p className="text-red-600 text-sm mt-1">{errors.shippingAddress.fullName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <Input
              {...register('shippingAddress.phone', { 
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: 'Please enter a valid phone number'
                }
              })}
              placeholder="0901234567"
            />
            {errors?.shippingAddress?.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.shippingAddress.phone.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address *
          </label>
          <Input
            {...register('shippingAddress.address', { required: 'Address is required' })}
            placeholder="Street address, apartment, suite, etc."
          />
          {errors?.shippingAddress?.address && (
            <p className="text-red-600 text-sm mt-1">{errors.shippingAddress.address.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <Input
              {...register('shippingAddress.city', { required: 'City is required' })}
              placeholder="Ho Chi Minh City"
            />
            {errors?.shippingAddress?.city && (
              <p className="text-red-600 text-sm mt-1">{errors.shippingAddress.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              District *
            </label>
            <Input
              {...register('shippingAddress.district', { required: 'District is required' })}
              placeholder="District 1"
            />
            {errors?.shippingAddress?.district && (
              <p className="text-red-600 text-sm mt-1">{errors.shippingAddress.district.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ward *
            </label>
            <Input
              {...register('shippingAddress.ward', { required: 'Ward is required' })}
              placeholder="Ben Nghe Ward"
            />
            {errors?.shippingAddress?.ward && (
              <p className="text-red-600 text-sm mt-1">{errors.shippingAddress.ward.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code (Optional)
          </label>
          <Input
            {...register('shippingAddress.postalCode')}
            placeholder="700000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Special instructions for delivery..."
          />
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentStep({ register, errors, watchedPaymentMethod, setValue }: any) {
  const paymentMethods = [
    { id: 'MoMo', name: 'MoMo E-Wallet', icon: Smartphone, description: 'Pay with MoMo app' },
    { id: 'VNPAY', name: 'VNPAY', icon: CreditCard, description: 'Credit/Debit cards, ATM cards' },
    { id: 'Cash', name: 'Cash on Delivery', icon: DollarSign, description: 'Pay when you receive' }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="border rounded-lg p-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                value={method.id}
                {...register('paymentMethod', { required: 'Please select a payment method' })}
                checked={watchedPaymentMethod === method.id}
                onChange={() => setValue('paymentMethod', method.id)}
                className="mr-3"
              />
              <method.icon className="w-6 h-6 mr-3 text-gray-600" />
              <div>
                <div className="font-medium text-gray-900">{method.name}</div>
                <div className="text-sm text-gray-600">{method.description}</div>
              </div>
            </label>
          </div>
        ))}
        
        {errors?.paymentMethod && (
          <p className="text-red-600 text-sm">{errors.paymentMethod.message}</p>
        )}
      </CardContent>
    </Card>
  )
}

function ReviewStep({ watch, cart }: any) {
  const formData = watch()
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shipping Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>Name:</strong> {formData.shippingAddress?.fullName}</p>
            <p><strong>Phone:</strong> {formData.shippingAddress?.phone}</p>
            <p><strong>Address:</strong> {formData.shippingAddress?.address}</p>
            <p><strong>Location:</strong> {formData.shippingAddress?.ward}, {formData.shippingAddress?.district}, {formData.shippingAddress?.city}</p>
            {formData.notes && <p><strong>Notes:</strong> {formData.notes}</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{formData.paymentMethod}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cart.items.map((item: any) => (
              <div key={item.id} className="flex items-center gap-4 py-3 border-b last:border-b-0">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                  {item.product.images[0] ? (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                      No Image
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                  <p className="text-sm text-gray-600">
                    Quantity: {item.quantity} × {formatPrice(item.variant.price)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatPrice(item.variant.price * item.quantity)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function OrderSummary({ cart, total, shipping, tax, finalTotal, itemCount }: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({itemCount} items)</span>
            <span>{formatPrice(total)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Tax (VAT 10%)</span>
            <span>{formatPrice(tax)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>
        </div>

        {shipping === 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-800 text-sm font-medium">
              🎉 You got free shipping!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
