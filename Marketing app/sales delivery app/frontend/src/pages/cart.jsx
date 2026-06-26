import { useEffect, useMemo } from 'react';
import useShop from '../hooks/useShop.js';
import Title from '../components/title.jsx';
import { assets } from '../assets/assets.js';
import CartTotal from '../components/cartTotal.jsx';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useShop();

  // Derive cart data from cartItems (no need for separate state)
  const cartData = useMemo(() => {
    if (products.length === 0) return [];
    const items = [];
    for (const itemId in cartItems) {
      for (const size in cartItems[itemId]) {
        if (cartItems[itemId][size] > 0) {
          items.push({
            _id: itemId,
            size,
            quantity: cartItems[itemId][size],
          });
        }
      }
    }
    return items;
  }, [cartItems, products]);

  return (
    <div className='border-t pt-14'>
      <div className='text-2xl mb-3'>
        <Title text1='YOUR' text2='CART' />
      </div>

      {cartData.length === 0 ? (
        <div className='text-center py-20 text-gray-400'>
          <p className='text-lg'>Your cart is empty</p>
          <button
            onClick={() => navigate('/collection')}
            className='mt-4 bg-black text-white px-8 py-3 text-sm hover:bg-gray-800 transition-colors'
          >
            CONTINUE SHOPPING
          </button>
        </div>
      ) : (
        <>
          <div>
            {cartData.map((item) => {
              const productData = products.find((product) => product._id === item._id);
              if (!productData) return null;
              return (
                <div
                  key={`${item._id}-${item.size}`}
                  className='py-4 border-t border-b text-gray-700 grid grid-cols-[4fr_0.5fr_0.5fr] sm:grid-cols-[4fr_2fr_0.5fr] items-center gap-4'
                >
                  <div className='flex items-start gap-6'>
                    <img className='w-16 sm:w-20' src={productData.image[0]} alt={productData.name} />
                    <div>
                      <p className='text-xs sm:text-lg font-medium'>{productData.name}</p>
                      <div className='flex items-center gap-5 mt-2'>
                        <p>{currency}{productData.price}</p>
                        <p className='px-2 sm:px-3 sm:py-1 border bg-slate-50'>{item.size}</p>
                      </div>
                    </div>
                  </div>
                  <input
                    onChange={(e) =>
                      e.target.value === '' || e.target.value === '0'
                        ? null
                        : updateQuantity(item._id, item.size, Number(e.target.value))
                    }
                    className='border max-w-10 sm:max-w-20 px-1 sm:px-2 py-1'
                    type='number'
                    min={1}
                    defaultValue={item.quantity}
                  />
                  <img
                    onClick={() => updateQuantity(item._id, item.size, 0)}
                    className='w-4 mr-4 sm:w-5 cursor-pointer'
                    src={assets.bin_icon}
                    alt='Remove item'
                  />
                </div>
              );
            })}
          </div>

          <div className='flex justify-end my-20'>
            <div className='w-full sm:w-112.5'>
              <CartTotal />
              <div className='w-full text-end'>
                <button
                  onClick={() => navigate('/place-order')}
                  className='bg-black text-white text-sm my-8 px-8 py-3 hover:bg-gray-800 transition-colors'
                >
                  PROCEED TO CHECKOUT
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Cart;