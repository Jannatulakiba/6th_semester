import { Link } from 'react-router';
import { assets } from '../assets/assets.js';

const Footer = () => {
  return (
    <footer>
      <div className='flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm'>
        {/* Left Side */}
        <div>
          <img src={assets.logo} className='mb-5 w-32' alt='Forever logo' />
          <p className='w-full md:w-2/3 text-gray-600'>
            Forever is your destination for premium fashion. We curate the finest clothing from trusted brands, delivering style and quality right to your doorstep since 2020.
          </p>
        </div>

        {/* Center Side */}
        <div>
          <p className='text-xl font-medium mb-5'>COMPANY</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li><Link to='/' className='hover:text-black transition-colors'>Home</Link></li>
            <li><Link to='/about' className='hover:text-black transition-colors'>About us</Link></li>
            <li><Link to='/collection' className='hover:text-black transition-colors'>Collection</Link></li>
            <li>Privacy policy</li>
          </ul>
        </div>

        {/* Right Side */}
        <div>
          <p className='text-xl font-medium mb-5'>GET IN TOUCH</p>
          <ul className='flex flex-col gap-1 text-gray-600'>
            <li>+1-212-456-7890</li>
            <li>contact@foreveryou.com</li>
          </ul>
        </div>
      </div>

      <div>
        <hr />
        <p className='py-5 text-sm text-center'>
          Copyright {new Date().getFullYear()}@ forever.com - All Right Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;