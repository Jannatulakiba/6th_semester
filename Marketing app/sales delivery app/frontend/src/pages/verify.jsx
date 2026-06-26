import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'react-toastify';
import { useVerifyStripeMutation } from '../redux/api/orderApiSlice.js';
import useShop from '../hooks/useShop.js';

const Verify = () => {
  const { navigate, token, setCartItems } = useShop();
  const [searchParams] = useSearchParams();

  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');

  const [verifyStripe] = useVerifyStripeMutation();

  useEffect(() => {
    if (!token) return;
    
    const verify = async () => {
      try {
        const res = await verifyStripe({ success, orderId }).unwrap();
        if (res.success) {
          navigate('/orders');
        } else {
          navigate('/cart');
        }
      } catch (error) {
        toast.error(error?.data?.message || error.message || 'Verification failed');
        navigate('/cart');
      }
    };
    
    verify();
  }, [token, success, orderId, navigate, verifyStripe]);

  return (
    <div className='min-h-[60vh] flex items-center justify-center'>
      <div className='w-20 h-20 border-4 border-gray-300 border-t-black rounded-full animate-spin' />
    </div>
  );
};

export default Verify;