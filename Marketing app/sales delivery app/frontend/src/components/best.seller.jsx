import { useMemo } from 'react';
import useShop from '../hooks/useShop.js';
import Title from './title.jsx';
import ProductItem from './product.item.jsx';

const BestSeller = () => {
  const { products } = useShop();

  // Derive best sellers — no need for separate state
  const bestSellers = useMemo(
    () => products.filter((item) => item.bestseller).slice(0, 5),
    [products]
  );

  return (
    <div className='my-10'>
      <div className='text-center text-3xl py-8'>
        <Title text1='BEST' text2='SELLERS' />
        <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
          Our most-loved pieces — top-rated by customers and always in demand.
        </p>
      </div>

      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {bestSellers.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            name={item.name}
            image={item.image}
            price={item.price}
          />
        ))}
      </div>
    </div>
  );
};

export default BestSeller;