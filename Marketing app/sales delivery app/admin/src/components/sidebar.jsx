/**
 * Sidebar navigation.
 * Renders navigation links for the admin panel sections.
 */
import { NavLink } from 'react-router';
import { assets } from '../assets/assets';

// ── Navigation items config ────────────────────────────────────────────────────
const NAV_ITEMS = [
  { to: '/', icon: assets.order_icon, label: 'Dashboard' },
  { to: '/add', icon: assets.add_icon, label: 'Add Items' },
  { to: '/list', icon: assets.order_icon, label: 'List Items' },
  { to: '/orders', icon: assets.order_icon, label: 'Orders' },
];

const LINK_CLASSES =
  'flex items-center gap-3 border border-gray-300 border-r-0 px-3 py-2 rounded-l';

const Sidebar = () => {
  return (
    <aside className='w-[18%] min-h-screen border-r-2'>
      <nav className='flex flex-col gap-4 pt-6 pl-[20%] text-[15px]'>
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink key={to} className={LINK_CLASSES} to={to}>
            <img src={icon} alt={label} className='w-5 h-5' />
            <p className='hidden md:block'>{label}</p>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;