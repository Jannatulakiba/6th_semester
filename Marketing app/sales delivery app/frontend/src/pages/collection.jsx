import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useIntersection } from 'react-use';
import { useGetPaginatedProductsQuery } from '../redux/api/productApiSlice.js';
import { assets } from '../assets/assets.js';
import useShop from '../hooks/useShop.js';
import Title from '../components/title.jsx';
import ProductItem from '../components/product.item.jsx';

const Collection = () => {
  const { products, search, showSearch, currency } = useShop();
  const [showFilter, setShowFilter] = useState(false);
  const [category, setCategory] = useState([]);
  const [subCategory, setSubCategory] = useState([]);
  const [sortType, setSortType] = useState('relevant');

  // Price range boundaries computed from product data
  const { absoluteMin, absoluteMax } = useMemo(() => {
    if (products.length === 0) return { absoluteMin: 0, absoluteMax: 1000 };
    const prices = products.map((p) => p.price);
    return { absoluteMin: Math.min(...prices), absoluteMax: Math.max(...prices) };
  }, [products]);

  const [priceRange, setPriceRange] = useState({ min: 0, max: Infinity });

  // Initialize price range once we have product data
  useMemo(() => {
    if (priceRange.min === 0 && priceRange.max === Infinity && products.length > 0) {
      setPriceRange({ min: absoluteMin, max: absoluteMax });
    }
  }, [absoluteMin, absoluteMax, products.length]);

  const handleMinPrice = useCallback((value) => {
    const num = Number(value);
    if (!isNaN(num)) {
      setPriceRange((prev) => ({ ...prev, min: Math.min(num, prev.max) }));
    }
  }, []);

  const handleMaxPrice = useCallback((value) => {
    const num = Number(value);
    if (!isNaN(num)) {
      setPriceRange((prev) => ({ ...prev, max: Math.max(num, prev.min) }));
    }
  }, []);

  const toggleCategory = useCallback((e) => {
    const value = e.target.value;
    setCategory((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }, []);

  const toggleSubCategory = useCallback((e) => {
    const value = e.target.value;
    setSubCategory((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }, []);

  const [page, setPage] = useState(1);
  const limit = 12;

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [category, subCategory, sortType, search, showSearch, priceRange, absoluteMin, absoluteMax]);

  const { data, isLoading, isFetching } = useGetPaginatedProductsQuery({
    page,
    limit,
    category: category.join(',') || undefined,
    subCategory: subCategory.join(',') || undefined,
    search: showSearch ? search : undefined,
    sort: sortType,
    minPrice: priceRange.min !== absoluteMin ? priceRange.min : undefined,
    maxPrice: priceRange.max !== absoluteMax ? priceRange.max : undefined,
  });

  const filteredProducts = data?.products || [];
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

  return (
    <div className='flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t'>
      {/* Filter Side */}
      <div className='min-w-60'>
        <p
          onClick={() => setShowFilter((prev) => !prev)}
          className='my-2 text-xl flex items-center cursor-pointer gap-2'
        >
          FILTERS
          <img className={`h-3 sm:hidden transition-transform ${showFilter ? 'rotate-90' : ''}`} src={assets.dropdown_icon} alt='Toggle filters' />
        </p>

        {/* Category Filter */}
        <div className={`border border-gray-300 pl-5 py-3 mt-6 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>CATEGORIES</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {['Men', 'Women', 'Kids'].map((item) => (
              <label key={item} className='flex gap-2 cursor-pointer'>
                <input className='w-3' type='checkbox' value={item} onChange={toggleCategory} /> {item}
              </label>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className={`border border-gray-300 pl-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>TYPE</p>
          <div className='flex flex-col gap-2 text-sm font-light text-gray-700'>
            {['Topwear', 'Bottomwear', 'Winterwear'].map((item) => (
              <label key={item} className='flex gap-2 cursor-pointer'>
                <input className='w-3' type='checkbox' value={item} onChange={toggleSubCategory} /> {item}
              </label>
            ))}
          </div>
        </div>

        {/* Price Range Filter */}
        <div className={`border border-gray-300 pl-5 pr-5 py-3 my-5 ${showFilter ? '' : 'hidden'} sm:block`}>
          <p className='mb-3 text-sm font-medium'>PRICE RANGE</p>
          <div className='flex flex-col gap-3'>
            {/* Price display */}
            <div className='flex items-center justify-between gap-2 text-sm text-gray-700'>
              <div className='flex items-center gap-1'>
                <span className='text-xs text-gray-500'>{currency}</span>
                <input
                  type='number'
                  value={priceRange.min === absoluteMin && priceRange.max === absoluteMax ? absoluteMin : priceRange.min}
                  onChange={(e) => handleMinPrice(e.target.value)}
                  min={absoluteMin}
                  max={priceRange.max}
                  className='w-16 border border-gray-300 rounded px-1.5 py-0.5 text-sm text-center focus:outline-none focus:border-gray-500'
                />
              </div>
              <span className='text-gray-400'>—</span>
              <div className='flex items-center gap-1'>
                <span className='text-xs text-gray-500'>{currency}</span>
                <input
                  type='number'
                  value={priceRange.min === absoluteMin && priceRange.max === absoluteMax ? absoluteMax : priceRange.max}
                  onChange={(e) => handleMaxPrice(e.target.value)}
                  min={priceRange.min}
                  max={absoluteMax}
                  className='w-16 border border-gray-300 rounded px-1.5 py-0.5 text-sm text-center focus:outline-none focus:border-gray-500'
                />
              </div>
            </div>

            {/* Dual range slider */}
            <div className='relative h-6 flex items-center'>
              <div className='absolute w-full h-1.5 bg-gray-200 rounded-full' />
              <div
                className='absolute h-1.5 bg-gray-800 rounded-full'
                style={{
                  left: `${((priceRange.min - absoluteMin) / (absoluteMax - absoluteMin)) * 100}%`,
                  right: `${100 - ((priceRange.max - absoluteMin) / (absoluteMax - absoluteMin)) * 100}%`,
                }}
              />
              <input
                type='range'
                min={absoluteMin}
                max={absoluteMax}
                step={10}
                value={priceRange.min}
                onChange={(e) => handleMinPrice(e.target.value)}
                className='absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-800 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-20 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-800 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:relative [&::-moz-range-thumb]:z-20'
              />
              <input
                type='range'
                min={absoluteMin}
                max={absoluteMax}
                step={10}
                value={priceRange.max}
                onChange={(e) => handleMaxPrice(e.target.value)}
                className='absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-800 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-30 [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gray-800 [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:relative [&::-moz-range-thumb]:z-30'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Product Display Side */}
      <div className='flex-1'>
        <div className='flex justify-between text-base sm:text-2xl mb-4'>
          <Title text1='ALL' text2='COLLECTIONS' />
          <select
            onChange={(e) => setSortType(e.target.value)}
            className='border-2 border-gray-300 text-sm px-2'
          >
            <option value='relevant'>Sort by: Relevant</option>
            <option value='low-high'>Sort by: Low to High</option>
            <option value='high-low'>Sort by: High to Low</option>
          </select>
        </div>

        {isLoading && page === 1 ? (
          <div className='flex justify-center py-20'>
            <div className='w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin' />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className='text-center py-20 text-gray-400'>
            <p className='text-lg'>No products found</p>
            <p className='text-sm mt-2'>Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 gap-y-6'>
              {filteredProducts.map((item) => (
                <ProductItem key={item._id} name={item.name} id={item._id} price={item.price} image={item.image} />
              ))}
            </div>
            
            {/* Intersection Observer Loader */}
            {page < totalPages && (
              <div ref={intersectionRef} className='flex justify-center mt-10 mb-5 py-4'>
                <div className='w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin' />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Collection;