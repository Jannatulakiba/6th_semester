import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useLoginAdminMutation } from '../redux/api/authApiSlice';

// --- Zod Schema ---
const adminLoginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const [loginAdmin, { isLoading }] = useLoginAdminMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      const data = await loginAdmin({ email: values.email, password: values.password }).unwrap();

      if (!data.success) {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error?.data?.message || error.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center w-full bg-gray-50">
      <div className="bg-white shadow-md rounded-lg px-8 py-6 max-w-md w-full border border-gray-100">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">Admin Panel</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="min-w-72">
            <label
              htmlFor="login-email"
              className="text-sm font-semibold text-gray-700 mb-2 block"
            >
              Email Address
            </label>
            <input
              id="login-email"
              {...register('email')}
              className={`rounded-md w-full px-3 py-2 border outline-none focus:ring-1 focus:ring-black ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              type="text"
              placeholder="your@email.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="text-sm font-semibold text-gray-700 mb-2 block"
            >
              Password
            </label>
            <input
              id="login-password"
              {...register('password')}
              className={`rounded-md w-full px-3 py-2 border outline-none focus:ring-1 focus:ring-black ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              type="password"
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          <button
            className="mt-4 w-full py-2.5 px-4 rounded-md text-white bg-black hover:bg-gray-800 transition-colors disabled:opacity-50 font-medium"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;