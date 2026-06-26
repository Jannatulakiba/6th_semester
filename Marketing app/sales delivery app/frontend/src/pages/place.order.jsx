import { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { usePlaceOrderMutation, usePlaceOrderStripeMutation } from '../redux/api/orderApiSlice.js';

import useShop from '../hooks/useShop.js';
import Title from '../components/title.jsx';
import CartTotal from '../components/cartTotal.jsx';
import { assets } from '../assets/assets.js';

// --- Zod Shipping Address Schema ---
const shippingAddressSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zipcode: z.string().min(1, 'Zipcode is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().min(1, 'Phone is required'),
});

const PlaceOrder = () => {
  const [method, setMethod] = useState('cod');
  const { navigate, cartItems, setCartItems, getCartAmount, delivery_fee, products } = useShop();
  const [placeOrder, { isLoading: codLoading }] = usePlaceOrderMutation();
  const [placeOrderStripe, { isLoading: stripeLoading }] = usePlaceOrderStripeMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      street: '',
      city: '',
      state: '',
      zipcode: '',
      country: '',
      phone: '',
    },
  });

  // Build order items from cart
  const buildOrderItems = useCallback(() => {
    const items = [];
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          const itemInfo = products.find((product) => product._id === itemId);
          if (itemInfo) {
            items.push({
              ...itemInfo,
              size,
              quantity: cartItems[itemId][size],
            });
          }
        }
      }
    }
    return items;
  }, [cartItems, products]);

  const isPending = codLoading || stripeLoading;

  const handleSuccess = (data) => {
    if (data.success) {
      setCartItems({});
      if (method === 'stripe' && data.session_url) {
        window.location.replace(data.session_url);
      } else {
        navigate('/orders');
      }
    } else {
      toast.error(data.message);
    }
  };

  const onSubmitHandler = async (formData) => {
    const items = buildOrderItems();
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    const orderData = {
      address: formData,
      items,
      amount: getCartAmount() + delivery_fee,
    };

    try {
      let data;
      if (method === 'cod') {
        data = await placeOrder(orderData).unwrap();
      } else if (method === 'stripe') {
        data = await placeOrderStripe(orderData).unwrap();
      }
      handleSuccess(data);
    } catch (error) {
      toast.error(error?.data?.message || error.message || 'Something went wrong');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh]">
      {/* Left Side */}
      <div className="flex flex-col gap-4 w-full sm:max-w-[480px]">
        <div className="text-xl sm:text-2xl my-3">
          <Title text1="DELIVERY" text2="INFORMATION" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <div className="w-full">
              <input
                {...register('firstName')}
                className={`border rounded py-1.5 px-3.5 w-full outline-none focus:ring-1 focus:ring-gray-900 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                type="text"
                placeholder="First name"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>}
            </div>
            <div className="w-full">
              <input
                {...register('lastName')}
                className={`border rounded py-1.5 px-3.5 w-full outline-none focus:ring-1 focus:ring-gray-900 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                type="text"
                placeholder="Last name"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>}
            </div>
          </div>
          
          <div>
            <input
              {...register('email')}
              className={`border rounded py-1.5 px-3.5 w-full outline-none focus:ring-1 focus:ring-gray-900 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              type="text"
              placeholder="Email address"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <input
              {...register('street')}
              className={`border rounded py-1.5 px-3.5 w-full outline-none focus:ring-1 focus:ring-gray-900 ${
                errors.street ? 'border-red-500' : 'border-gray-300'
              }`}
              type="text"
              placeholder="Street"
            />
            {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street.message}</p>}
          </div>

          <div className="flex gap-3">
            <div className="w-full">
              <input
                {...register('city')}
                className={`border rounded py-1.5 px-3.5 w-full outline-none focus:ring-1 focus:ring-gray-900 ${
                  errors.city ? 'border-red-500' : 'border-gray-300'
                }`}
                type="text"
                placeholder="City"
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city.message}</p>}
            </div>
            <div className="w-full">
              <input
                {...register('state')}
                className={`border rounded py-1.5 px-3.5 w-full outline-none focus:ring-1 focus:ring-gray-900 ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
                type="text"
                placeholder="State"
              />
              {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
            </div>
          </div>

          <div className="flex gap-3">
            <div className="w-full">
              <input
                {...register('zipcode')}
                className={`border rounded py-1.5 px-3.5 w-full outline-none focus:ring-1 focus:ring-gray-900 ${
                  errors.zipcode ? 'border-red-500' : 'border-gray-300'
                }`}
                type="text"
                placeholder="Zipcode"
              />
              {errors.zipcode && <p className="text-red-500 text-xs mt-1">{errors.zipcode.message}</p>}
            </div>
            <div className="w-full">
              <input
                {...register('country')}
                className={`border rounded py-1.5 px-3.5 w-full outline-none focus:ring-1 focus:ring-gray-900 ${
                  errors.country ? 'border-red-500' : 'border-gray-300'
                }`}
                type="text"
                placeholder="Country"
              />
              {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country.message}</p>}
            </div>
          </div>

          <div>
            <input
              {...register('phone')}
              className={`border rounded py-1.5 px-3.5 w-full outline-none focus:ring-1 focus:ring-gray-900 ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              type="text"
              placeholder="Phone"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="mt-8">
        <div className="mt-8 min-w-80">
          <CartTotal />
        </div>
        <div className="mt-12">
          <Title text1="PAYMENT" text2="METHOD" />
          <div className="flex gap-3 flex-col lg:flex-row">
            <div onClick={() => setMethod('stripe')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full transition-colors ${method === 'stripe' ? 'bg-green-400' : ''}`} />
              <img className="h-5 mx-4" src={assets.stripe_logo} alt="Stripe" />
            </div>
            <div onClick={() => setMethod('cod')} className="flex items-center gap-3 border p-2 px-3 cursor-pointer">
              <p className={`min-w-3.5 h-3.5 border rounded-full transition-colors ${method === 'cod' ? 'bg-green-400' : ''}`} />
              <p className="text-gray-500 text-sm font-medium mx-4">CASH ON DELIVERY</p>
            </div>
          </div>
          <div className="w-full text-end mt-8">
            <button
              type="submit"
              disabled={isPending}
              className="bg-black text-white px-16 py-3 text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'PLACING ORDER...' : 'PLACE ORDER'}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default PlaceOrder;