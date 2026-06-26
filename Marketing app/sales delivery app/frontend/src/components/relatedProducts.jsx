import { useMemo } from 'react';
import useShop from '../hooks/useShop.js';
import Title from './title.jsx';
import ProductItem from './product.item.jsx';

const RelatedProducts = ({ category, subCategory }) => {
  const { products } = useShop();

  // Derived state — filter products by category + subCategory
  const related = useMemo(() => {
    if (products.length === 0) return [];
    return products
      .filter((item) => item.category === category && item.subCategory === subCategory)
      .slice(0, 5);
  }, [products, category, subCategory]);

  if (related.length === 0) return null;

  return (
    <div className='my-24'>
      <div className='text-center text-3xl py-2'>
        <Title text1='RELATED' text2='PRODUCTS' />
      </div>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
        {related.map((item) => (
          <ProductItem
            key={item._id}
            id={item._id}
            name={item.name}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;