import { useState, useRef, useEffect } from 'react';
import { useIntersection } from 'react-use';
import useShop from '../hooks/useShop.js';
import { useGetUserOrdersQuery } from '../redux/api/orderApiSlice.js';
import Title from '../components/title.jsx';

const Orders = () => {
  const { token, currency } = useShop();
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, refetch } = useGetUserOrdersQuery({ page, limit: 10 }, { skip: !token });
  
  const orderData = data?.items || [];
  const totalPages = data?.totalPages || 1;

  const intersectionRef = useRef(null);
  const intersection = useIntersection(intersectionRef, {
    root: null,
    rootMargin: '100px',
    threshold: 0.1
  });

  useEffect(() => {
    if (intersection && intersection.isIntersecting && !isFetching && page < totalPages) {
      setPage(prev => prev + 1);
    }
  }, [intersection, isFetching, page, totalPages]);

  if (isLoading && page === 1) {
    return (
      <div className='min-h-[60vh] flex items-center justify-center'>
        <div className='w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin' />
      </div>
    );
  }

  return (
    <div className='border-t pt-16'>
      <div className='text-2xl'>
        <Title text1='MY' text2='ORDERS' />
      </div>
      {orderData.length === 0 ? (
        <div className='text-center py-20 text-gray-400'>
          <p className='text-lg'>No orders yet</p>
          <p className='text-sm mt-2'>Your order history will appear here.</p>
        </div>
      ) : (
        <div>
          {orderData.map((item, index) => (
            <div key={index} className='py-4 border-t border-b text-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
              <div className='flex items-start gap-6 text-sm'>
                <img className='w-16 sm:w-20' src={item.image[0]} alt={item.name} />
                <div>
                  <p className='sm:text-base font-medium'>{item.name}</p>
                  <div className='flex items-center gap-3 mt-2 text-base text-gray-700'>
                    <p>{currency}{item.price}</p>
                    <p>Quantity: {item.quantity}</p>
                    <p>Size: {item.size}</p>
                  </div>
                  <p className='mt-2'>
                    Date: <span className='text-gray-400'>{new Date(item.date).toDateString()}</span>
                  </p>
                  <p className='mt-2'>
                    Payment: <span className='text-gray-400'>{item.paymentMethod}</span>
                  </p>
                </div>
              </div>
              <div className='md:w-1/2 flex justify-between'>
                <div className='flex items-center gap-2'>
                  <p className={`min-w-2 h-2 rounded-full ${item.status === 'Delivered' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <p className='text-sm md:text-base'>{item.status}</p>
                </div>
                <button
                  onClick={() => refetch()}
                  className='border px-4 py-2 text-sm font-medium rounded-sm hover:bg-gray-50 transition-colors'
                >
                  Track Order
                </button>
              </div>
            </div>
          ))}
          
          {/* Intersection Observer Loader */}
          {page < totalPages && (
            <div ref={intersectionRef} className='flex justify-center mt-8 mb-4 py-4'>
              <div className='w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin' />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Orders;