import { memo } from 'react';
import { Link } from 'react-router';
import useShop from '../hooks/useShop.js';

/**
 * Single product card — memoized because it renders inside large lists
 * and its props (id, image, name, price) rarely change.
 */
const ProductItem = memo(({ id, image, name, price }) => {
  const { currency } = useShop();

  return (
    <Link className='text-gray-700 cursor-pointer group' to={`/product/${id}`}>
      <div className='overflow-hidden rounded-lg'>
        <img
          className='w-full transition-transform duration-300 ease-out group-hover:scale-110'
          src={image[0]}
          alt={name}
          loading='lazy'
        />
      </div>
      <p className='pt-3 pb-1 text-sm truncate'>{name}</p>
      <p className='text-sm font-medium'>
        {currency}{price}
      </p>
    </Link>
  );
});

ProductItem.displayName = 'ProductItem';

export default ProductItem;