/**
 * Root application component.
 * Handles authenticated vs. unauthenticated layout rendering.
 */
import { Routes, Route } from 'react-router';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useSelector } from 'react-redux';
import Navbar from './components/navbar';
import Sidebar from './components/sidebar';
import Login from './components/login';
import Add from './pages/add';
import List from './pages/list';
import Orders from './pages/orders';
import Dashboard from './pages/dashboard';

// ── Authenticated layout ───────────────────────────────────────────────────────
const AuthenticatedLayout = () => (
  <>
    <Navbar />
    <hr />
    <div className='flex w-full'>
      <Sidebar />
      <main className='w-full lg:w-[75%] mx-auto lg:ml-[max(5vw,25px)] my-8 text-gray-600 text-base'>
        <Routes>
          <Route path='/' element={<Dashboard />} />
          <Route path='/dashboard' element={<Dashboard />} />
          <Route path='/add' element={<Add />} />
          <Route path='/list' element={<List />} />
          <Route path='/orders' element={<Orders />} />
        </Routes>
      </main>
    </div>
  </>
);

// ── App ────────────────────────────────────────────────────────────────────────
const App = () => {
  const token = useSelector((state) => state.auth.token);
  const isAuthenticated = !!token;

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer />
      {isAuthenticated ? <AuthenticatedLayout /> : <Login />}
    </div>
  );
};

export default App;