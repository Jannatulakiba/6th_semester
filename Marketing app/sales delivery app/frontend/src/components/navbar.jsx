import { useState, useCallback } from 'react';
import { Link, NavLink } from 'react-router';
import { assets } from '../assets/assets.js';
import useShop from '../hooks/useShop.js';

const Navbar = () => {
  const [visible, setVisible] = useState(false);
  const { setShowSearch, getCartCount, navigate, token, logout, user } = useShop();


  const closeSidebar = useCallback(() => setVisible(false), []);

  return (
    <div className='flex items-center justify-between py-5 font-medium'>
      <Link to='/'>
        <img src={assets.logo} className='w-36' alt='Forever logo' />
      </Link>

      <ul className='hidden sm:flex gap-5 text-sm text-gray-700'>
        <NavLink to='/' className='flex flex-col items-center gap-1'>
          <p>Home</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/collection' className='flex flex-col items-center gap-1'>
          <p>Collection</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/about' className='flex flex-col items-center gap-1'>
          <p>About</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
        <NavLink to='/contact' className='flex flex-col items-center gap-1'>
          <p>Contact</p>
          <hr className='w-2/4 border-none h-[1.5px] bg-gray-700 hidden' />
        </NavLink>
      </ul>

      <div className='flex items-center gap-6'>
        <img
          onClick={() => setShowSearch(true)}
          src={assets.search_icon}
          className='w-5 cursor-pointer'
          alt='Search'
        />

        <div className='group relative flex items-center'>
          {token ? (
            user?.profilePhoto ? (
              <img
                onClick={() => navigate('/dashboard')}
                className='w-8 h-8 rounded-full object-cover cursor-pointer border border-gray-200 hover:shadow-md transition-shadow'
                src={user.profilePhoto}
                alt='Profile'
              />
            ) : (
              <div 
                onClick={() => navigate('/dashboard')}
                className='w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-semibold text-sm cursor-pointer hover:shadow-md transition-shadow'
              >
                {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
            )
          ) : (
            <img
              onClick={() => navigate('/login')}
              className='w-5 cursor-pointer'
              src={assets.profile_icon}
              alt='Profile'
            />
          )}

          {token && (
            <div className='group-hover:block hidden absolute right-0 top-full pt-2 z-10'>
              <div className='flex flex-col gap-2 w-48 py-3 px-5 bg-white text-gray-500 rounded-xl shadow-xl border border-gray-100'>
                {user && (
                  <div className='border-b border-gray-100 pb-2 mb-1'>
                    <p className='font-semibold text-gray-900 truncate'>{user.name || 'User'}</p>
                    <p className='text-xs text-gray-500 truncate'>{user.email}</p>
                  </div>
                )}
                <p onClick={() => navigate('/dashboard')} className='cursor-pointer hover:text-black transition-colors'>
                  Dashboard
                </p>
                <p onClick={() => navigate('/orders')} className='cursor-pointer hover:text-black transition-colors'>
                  Orders
                </p>
                <p onClick={() => { logout(); navigate('/login'); }} className='cursor-pointer hover:text-red-600 transition-colors text-red-500 pt-1 border-t border-gray-50'>
                  Logout
                </p>
              </div>
            </div>
          )}
        </div>

        <Link to='/cart' className='relative'>
          <img src={assets.cart_icon} className='w-5 min-w-5' alt='Cart' />
          <p className='absolute -right-1.25 -bottom-1.25 w-4 text-center leading-4 bg-black text-white aspect-square rounded-full text-[8px]'>
            {getCartCount()}
          </p>
        </Link>

        <img
          onClick={() => setVisible(true)}
          src={assets.menu_icon}
          className='w-5 cursor-pointer sm:hidden'
          alt='Menu'
        />
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 right-0 bottom-0 z-50 overflow-hidden bg-white transition-all duration-300 ${
          visible ? 'w-full' : 'w-0'
        }`}
      >
        <div className='flex flex-col text-gray-600'>
          <div onClick={closeSidebar} className='flex items-center gap-4 p-3 cursor-pointer'>
            <img className='h-4 rotate-180' src={assets.dropdown_icon} alt='Back' />
            <p>Back</p>
          </div>
          <NavLink onClick={closeSidebar} className='py-2 pl-6 border' to='/'>Home</NavLink>
          <NavLink onClick={closeSidebar} className='py-2 pl-6 border' to='/collection'>Collection</NavLink>
          <NavLink onClick={closeSidebar} className='py-2 pl-6 border' to='/about'>About</NavLink>
          <NavLink onClick={closeSidebar} className='py-2 pl-6 border' to='/contact'>Contact</NavLink>
        </div>
      </div>
    </div>
  );
};

export default Navbar;