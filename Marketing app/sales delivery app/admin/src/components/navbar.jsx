/**
 * Top navigation bar.
 * Displays the brand logo and provides a logout action.
 */
import { assets } from '../assets/assets';
import { useDispatch } from 'react-redux';
import { logout } from '../redux/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();

  return (
    <nav className='flex items-center py-2 px-[4%] justify-between'>
      <img
        src={assets.logo}
        alt='Admin logo'
        className='w-[max(10%,80px)]'
      />
      <button
        onClick={() => dispatch(logout())}
        className='bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm'
      >
        Logout
      </button>
    </nav>
  );
};

export default Navbar;