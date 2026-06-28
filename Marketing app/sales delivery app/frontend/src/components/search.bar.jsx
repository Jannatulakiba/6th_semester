import { useCallback } from 'react';
import { useLocation } from 'react-router';
import { assets } from '../assets/assets.js';
import useShop from '../hooks/useShop.js';

const SearchBar = () => {
  const { search, setSearch, showSearch, setShowSearch } = useShop();
  const location = useLocation();

  // Only show search bar on the collection page
  const isCollectionPage = location.pathname.includes('collection');

  const handleClose = useCallback(() => setShowSearch(false), [setShowSearch]);
  const handleChange = useCallback((e) => setSearch(e.target.value), [setSearch]);

  if (!showSearch || !isCollectionPage) return null;

  return (
    <div className='text-center'>
      <div className='inline-flex items-center justify-center border border-gray-400 px-5 py-2 my-5 mx-3 rounded-full w-3/4 sm:w-1/2'>
        <input
          value={search}
          onChange={handleChange}
          className='flex-1 outline-none bg-inherit text-sm'
          type='text'
          placeholder='Search'
          autoFocus
        />
        <img className='w-4' src={assets.search_icon} alt='Search' />
      </div>
      <img
        onClick={handleClose}
        className='inline w-3 cursor-pointer'
        src={assets.cross_icon}
        alt='Close search'
      />
    </div>
  );
};

export default SearchBar;