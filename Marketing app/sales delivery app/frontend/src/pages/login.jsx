import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import { FaEnvelope, FaEye, FaEyeSlash, FaLock, FaUser, FaCamera } from 'react-icons/fa';
import useShop from '../hooks/useShop.js';
import { useLoginMutation, useRegisterMutation } from '../redux/api/authApiSlice.js';

// --- Constants ---
const PASSWORD_RULES = {
  MIN_LENGTH: 8,
  PATTERNS: {
    UPPERCASE: /[A-Z]/,
    LOWERCASE: /[a-z]/,
    NUMBER: /[0-9]/,
    SPECIAL: /[!@#$%^&*(),.?":{}|<>]/,
  },
};

const FILE_LIMITS = {
  PROFILE_PHOTO_MAX: 5 * 1024 * 1024,  // 5MB
};

// --- Zod Validation Schemas ---
const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const signUpSchema = z.object({
  name: z.string().min(1, 'Full name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string()
    .min(PASSWORD_RULES.MIN_LENGTH, `Password must be at least ${PASSWORD_RULES.MIN_LENGTH} characters`)
    .refine((val) => PASSWORD_RULES.PATTERNS.UPPERCASE.test(val), 'Must contain at least one uppercase letter')
    .refine((val) => PASSWORD_RULES.PATTERNS.NUMBER.test(val), 'Must contain at least one number')
    .refine((val) => PASSWORD_RULES.PATTERNS.SPECIAL.test(val), 'Must contain at least one special character'),
});

// --- Animations ---
const formVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const slideInLeft = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

// --- Password Strength helper ---
const calculatePasswordStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= PASSWORD_RULES.MIN_LENGTH) score++;
  if (PASSWORD_RULES.PATTERNS.UPPERCASE.test(pwd)) score++;
  if (PASSWORD_RULES.PATTERNS.LOWERCASE.test(pwd)) score++;
  if (PASSWORD_RULES.PATTERNS.NUMBER.test(pwd)) score++;
  if (PASSWORD_RULES.PATTERNS.SPECIAL.test(pwd)) score++;

  if (score <= 2) return { score: 1, text: 'Weak', color: 'bg-red-500' };
  if (score <= 4) return { score: 2, text: 'Medium', color: 'bg-yellow-500' };
  return { score: 3, text: 'Strong', color: 'bg-green-500' };
};

const PASSWORD_CHECKS = [
  { test: (p) => p.length >= PASSWORD_RULES.MIN_LENGTH, label: `At least ${PASSWORD_RULES.MIN_LENGTH} characters` },
  { test: (p) => PASSWORD_RULES.PATTERNS.UPPERCASE.test(p), label: 'One uppercase letter' },
  { test: (p) => PASSWORD_RULES.PATTERNS.NUMBER.test(p), label: 'One number' },
  { test: (p) => PASSWORD_RULES.PATTERNS.SPECIAL.test(p), label: 'One special character' },
];

const Login = () => {
  const { token, setToken, navigate } = useShop();
  const [isSignUp, setIsSignUp] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const fileInputRef = useRef(null);

  const [login, loginResult] = useLoginMutation();
  const [registerMut, registerResult] = useRegisterMutation();
  const isPending = loginResult.isLoading || registerResult.isLoading;

  // Choose schema dynamically
  const schema = isSignUp ? signUpSchema : loginSchema;

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const passwordValue = watch('password', '');

  const passwordStrength = useMemo(
    () => (passwordValue ? calculatePasswordStrength(passwordValue) : { score: 0, text: '', color: '' }),
    [passwordValue]
  );

  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > FILE_LIMITS.PROFILE_PHOTO_MAX) {
      toast.error('Image must be less than 5MB');
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }, []);

  const handleToggleMode = () => {
    setIsSignUp((prev) => !prev);
    setPhoto(null);
    setPhotoPreview(null);
    setShowPassword(false);
    reset();
  };

  const onSubmit = async (values) => {
    try {
      let data;
      if (isSignUp) {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('email', values.email);
        formData.append('password', values.password);
        if (photo) formData.append('photo', photo);

        data = await registerMut(formData).unwrap();
      } else {
        data = await login({ email: values.email, password: values.password }).unwrap();
      }

      if (data.success) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
      } else {
        toast.error(data.message || 'Authentication failed');
      }
    } catch (err) {
      if (err?.data?.errors && Array.isArray(err.data.errors)) {
        err.data.errors.forEach((e) => toast.error(e.message));
      } else {
        toast.error(err?.data?.message || err.message || 'Something went wrong');
      }
    }
  };

  const getIconClass = useCallback(
    (field) => `transition-colors ${focusedField === field ? 'text-gray-800' : 'text-gray-400'}`,
    [focusedField]
  );

  // Redirect if already logged in
  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <motion.form onSubmit={handleSubmit(onSubmit)} className="space-y-6" variants={formVariants} initial="hidden" animate="visible">
          <motion.div className="text-center mb-8" variants={slideInLeft}>
            <div className="inline-flex items-center gap-2 mb-2">
              <h2 className="prata-regular text-4xl text-gray-900">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            </div>
            <hr className="border-none h-[2px] w-12 bg-gray-900 mx-auto mt-2 mb-4" />
            <p className="text-gray-500">{isSignUp ? 'Join our premium community' : 'Login to your account'}</p>
          </motion.div>

          <AnimatePresence>
            {isSignUp && (
              <>
                {/* Photo Upload */}
                <motion.div variants={slideInLeft} initial="hidden" animate="visible" exit={{ opacity: 0, height: 0 }} className="flex flex-col items-center mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Profile Photo (Optional)</label>
                  <div className="relative">
                    <motion.div
                      className="w-28 h-28 rounded-full border-2 border-dashed border-gray-300 overflow-hidden bg-gray-50 cursor-pointer hover:border-gray-800 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400"><FaUser size={32} /></div>
                      )}
                    </motion.div>
                    <motion.div
                      className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-gray-700 shadow-md"
                      whileHover={{ scale: 1.1 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FaCamera size={14} />
                    </motion.div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  <p className="text-xs text-gray-400 mt-2">Max 5MB • JPG, PNG, WebP</p>
                </motion.div>

                {/* Name */}
                <motion.div variants={slideInLeft} initial="hidden" animate="visible" exit={{ opacity: 0, height: 0 }}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaUser className={getIconClass('name')} /></div>
                    <input
                      type="text"
                      {...registerField('name')}
                      onFocus={() => setFocusedField('name')}
                      onBlur={() => setFocusedField(null)}
                      className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-1 focus:ring-gray-900 outline-none transition-all ${
                        errors.name ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'
                      }`}
                      placeholder="Enter your name"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Email */}
          <motion.div variants={slideInLeft}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaEnvelope className={getIconClass('email')} /></div>
              <input
                type="email"
                {...registerField('email')}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-11 pr-4 py-3 border rounded-lg focus:ring-1 focus:ring-gray-900 outline-none transition-all ${
                  errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'
                }`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </motion.div>

          {/* Password */}
          <motion.div variants={slideInLeft}>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><FaLock className={getIconClass('password')} /></div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...registerField('password')}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className={`w-full pl-11 pr-11 py-3 border rounded-lg focus:ring-1 focus:ring-gray-900 outline-none transition-all ${
                  errors.password ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-gray-900'
                }`}
                placeholder="Enter your password"
              />
              <button type="button" onClick={() => setShowPassword((prev) => !prev)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600">
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}

            {isSignUp && passwordValue && (
              <motion.div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div className={`h-full ${passwordStrength.color}`} initial={{ width: 0 }} animate={{ width: `${(passwordStrength.score / 3) * 100}%` }} />
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${passwordStrength.score === 1 ? 'text-red-500' : passwordStrength.score === 2 ? 'text-yellow-500' : 'text-green-500'}`}>{passwordStrength.text}</span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] sm:text-xs">
                  {PASSWORD_CHECKS.map((check) => {
                    const passed = check.test(passwordValue);
                    return (
                      <div key={check.label} className={`flex items-center gap-1.5 ${passed ? 'text-green-600' : 'text-gray-400'}`}>
                        <span className="text-[10px]">{passed ? '✓' : '○'}</span><span>{check.label}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>

          <div className="w-full flex justify-between text-sm mt-[-8px]">
            {!isSignUp && <p className="cursor-pointer text-gray-500 hover:text-gray-800 transition-colors">Forgot your password?</p>}
            <p className="cursor-pointer text-gray-500 hover:text-gray-800 transition-colors ml-auto" onClick={handleToggleMode}>
              {isSignUp ? 'Already have an account? Login' : 'Create new account'}
            </p>
          </div>

          {/* Submit */}
          <motion.button type="submit" disabled={isPending} className="w-full bg-black text-white font-medium py-3 rounded-lg shadow-md hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4" variants={slideInLeft} whileHover={{ scale: isPending ? 1 : 1.01 }} whileTap={{ scale: isPending ? 1 : 0.98 }}>
            {isPending ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </motion.button>
        </motion.form>
      </div>
    </div>
  );
};

export default Login;