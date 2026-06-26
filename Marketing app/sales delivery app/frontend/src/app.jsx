import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router';
import { ToastContainer } from 'react-toastify';
import Navbar from './components/navbar.jsx';
import Footer from './components/footer.jsx';
import SearchBar from './components/search.bar.jsx';

// ── Lazy-loaded pages (code-split per route) ─────────────────────
const Home = lazy(() => import('./pages/home.jsx'));
const Collection = lazy(() => import('./pages/collection.jsx'));
const About = lazy(() => import('./pages/about.jsx'));
const Contact = lazy(() => import('./pages/contact.jsx'));
const Product = lazy(() => import('./pages/product.jsx'));
const Cart = lazy(() => import('./pages/cart.jsx'));
const Login = lazy(() => import('./pages/login.jsx'));
const PlaceOrder = lazy(() => import('./pages/place.order.jsx'));
const Orders = lazy(() => import('./pages/orders.jsx'));
const Verify = lazy(() => import('./pages/verify.jsx'));
const Dashboard = lazy(() => import('./pages/dashboard.jsx'));

/** Full-page loading spinner for Suspense fallback */
const PageLoader = () => (
  <div className='min-h-[60vh] flex items-center justify-center'>
    <div className='w-12 h-12 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin' />
  </div>
);

const App = () => {
  return (
    <div className='px-4 sm:px-[5vw] md:px-[7vw] lg:px-[9vw]'>
      <ToastContainer />
      <Navbar />
      <SearchBar />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/collection' element={<Collection />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/product/:productId' element={<Product />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/login' element={<Login />} />
          <Route path='/place-order' element={<PlaceOrder />} />
          <Route path='/orders' element={<Orders />} />
          <Route path='/verify' element={<Verify />} />
          <Route path='/dashboard' element={<Dashboard />} />
        </Routes>
      </Suspense>
      <Footer />
    </div>
  );
};

export default App;