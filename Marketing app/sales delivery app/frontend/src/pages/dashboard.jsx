import { useReducer, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  User, Package, Star, MessageCircle, Edit3, Camera,
  Lock, Save, X, TrendingUp, Calendar, Loader2, ShoppingBag, Eye, DollarSign, Clock,
  Crown, Truck, CheckCircle2, ChevronDown, Gift, ShieldCheck, Zap
} from 'lucide-react';
import useShop from '../hooks/useShop.js';
import { useGetDashboardQuery, useUpdateProfileMutation, useChangePasswordMutation } from '../redux/api/userApiSlice.js';
import { AnimatedCounter } from '../components/AnimatedCounter.jsx';

// ─── Reducer ──────────────────────────────────────────────────────────────────

const ACTIONS = {
  SET_DATA: 'SET_DATA',
  SET_SAVING: 'SET_SAVING',
  TOGGLE_EDIT_MODE: 'TOGGLE_EDIT_MODE',
  TOGGLE_PASSWORD_MODE: 'TOGGLE_PASSWORD_MODE',
  SET_EDIT_FIELD: 'SET_EDIT_FIELD',
  SET_PASSWORD_FIELD: 'SET_PASSWORD_FIELD',
  SET_NEW_PHOTO: 'SET_NEW_PHOTO',
  CANCEL_EDIT: 'CANCEL_EDIT',
  CANCEL_PASSWORD: 'CANCEL_PASSWORD',
  SAVE_PROFILE_SUCCESS: 'SAVE_PROFILE_SUCCESS',
  CHANGE_PASSWORD_SUCCESS: 'CHANGE_PASSWORD_SUCCESS',
};

const initialState = {
  dashboardData: null,
  loading: true,
  saving: false,
  editMode: false,
  passwordMode: false,
  editName: '',
  editBio: '',
  newPhoto: null,
  photoPreview: null,
  currentPassword: '',
  newPassword: '',
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_DATA:
      return {
        ...state,
        dashboardData: action.data,
        editName: action.data.user.name || '',
        editBio: action.data.user.bio || '',
        loading: false,
      };
    case ACTIONS.SET_SAVING:
      return { ...state, saving: action.saving };
    case ACTIONS.TOGGLE_EDIT_MODE:
      return { ...state, editMode: true };
    case ACTIONS.TOGGLE_PASSWORD_MODE:
      return { ...state, passwordMode: true };
    case ACTIONS.SET_EDIT_FIELD:
      return { ...state, [action.field]: action.value };
    case ACTIONS.SET_PASSWORD_FIELD:
      return { ...state, [action.field]: action.value };
    case ACTIONS.SET_NEW_PHOTO:
      return { ...state, newPhoto: action.file, photoPreview: action.preview };
    case ACTIONS.CANCEL_EDIT:
      return {
        ...state,
        editMode: false,
        newPhoto: null,
        photoPreview: null,
        editName: state.dashboardData?.user?.name || '',
        editBio: state.dashboardData?.user?.bio || '',
      };
    case ACTIONS.CANCEL_PASSWORD:
      return { ...state, passwordMode: false, currentPassword: '', newPassword: '' };
    case ACTIONS.SAVE_PROFILE_SUCCESS:
      return {
        ...state,
        editMode: false,
        newPhoto: null,
        photoPreview: null,
        saving: false,
        dashboardData: {
          ...state.dashboardData,
          user: { ...state.dashboardData.user, ...action.updatedUser },
        },
      };
    case ACTIONS.CHANGE_PASSWORD_SUCCESS:
      return { ...state, passwordMode: false, currentPassword: '', newPassword: '', saving: false };
    default:
      return state;
  }
};

// ─── Stat Card Config ─────────────────────────────────────────────────────────

const STAT_CARDS = [
  { label: 'Total Orders', key: 'totalOrders', icon: Package, gradient: 'from-blue-500 to-indigo-500', bg: 'bg-blue-50' },
  { label: 'Total Spent', key: 'totalSpent', icon: DollarSign, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', prefix: '$' },
  { label: 'Pending', key: 'pendingOrders', icon: Clock, gradient: 'from-orange-500 to-amber-500', bg: 'bg-orange-50' },
];

const QUICK_ACTIONS = [
  { label: 'Browse Collection', icon: Eye, path: '/collection', colors: 'from-blue-50 to-indigo-50 border-blue-100 text-blue-700' },
  { label: 'My Orders', icon: Package, path: '/orders', colors: 'from-emerald-50 to-teal-50 border-emerald-100 text-emerald-700' },
  { label: 'Shopping Cart', icon: ShoppingBag, path: '/cart', colors: 'from-orange-50 to-amber-50 border-orange-100 text-orange-700' },
];

const getLoyaltyTier = (spent) => {
  if (spent >= 1000) return { name: 'Platinum', color: 'from-slate-200 to-slate-400', next: null };
  if (spent >= 500) return { name: 'Gold', color: 'from-amber-300 to-yellow-500', next: 1000 };
  if (spent >= 200) return { name: 'Silver', color: 'from-gray-300 to-gray-400', next: 500 };
  return { name: 'Bronze', color: 'from-orange-400 to-orange-600', next: 200 };
};

const TIER_BENEFITS = {
  Bronze: [
    { icon: Truck, text: 'Free shipping on orders over $50' },
    { icon: Zap, text: 'Early access to sales' }
  ],
  Silver: [
    { icon: Truck, text: 'Free standard shipping on all orders' },
    { icon: Gift, text: '10% off your birthday month' },
    { icon: ShieldCheck, text: 'Priority customer support' }
  ],
  Gold: [
    { icon: Truck, text: 'Free express shipping' },
    { icon: Gift, text: '15% off your birthday month' },
    { icon: Star, text: 'Exclusive VIP collections' }
  ],
  Platinum: [
    { icon: Truck, text: 'Free overnight shipping' },
    { icon: Gift, text: '25% off your birthday month' },
    { icon: Star, text: 'Personal styling session' }
  ]
};

// ─── Dashboard Component ──────────────────────────────────────────────────────

const Dashboard = () => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { token, navigate, setUser } = useShop();
  const [expandedOrder, setExpandedOrder] = useState(null); // Track which order is expanded

  const {
    dashboardData, saving, editMode, passwordMode,
    editName, editBio, newPhoto, photoPreview, currentPassword, newPassword,
  } = state;

  const { data: dashboardRes, isLoading: isDashboardLoading } = useGetDashboardQuery(undefined, { skip: !token });
  const [updateProfileMut] = useUpdateProfileMutation();
  const [changePasswordMut] = useChangePasswordMutation();

  // ─── Auth Guard ───────────────────────────────────────────────────────────

  useEffect(() => {
    if (!token) navigate('/login');
  }, [token, navigate]);

  // ─── Data Fetching ────────────────────────────────────────────────────────

  useEffect(() => {
    if (dashboardRes?.success) {
      dispatch({ type: ACTIONS.SET_DATA, data: dashboardRes });
    }
  }, [dashboardRes]);

  // ─── Profile Editing ──────────────────────────────────────────────────────

  const handlePhotoChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    dispatch({ type: ACTIONS.SET_NEW_PHOTO, file, preview: URL.createObjectURL(file) });
  }, []);

  const handleSaveProfile = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_SAVING, saving: true });
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('bio', editBio);
      if (newPhoto) formData.append('photo', newPhoto);

      const res = await updateProfileMut(formData).unwrap();
      const updatedUser = res?.user;
      if (updatedUser) {
        dispatch({ type: ACTIONS.SAVE_PROFILE_SUCCESS, updatedUser });
        // Instantly sync global context so Navbar updates without reload
        setUser(updatedUser);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Unexpected response from server');
        dispatch({ type: ACTIONS.SET_SAVING, saving: false });
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update profile');
      dispatch({ type: ACTIONS.SET_SAVING, saving: false });
    }
  }, [editName, editBio, newPhoto, setUser]);

  const handleChangePassword = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_SAVING, saving: true });
    try {
      await changePasswordMut({ currentPassword, newPassword }).unwrap();
      dispatch({ type: ACTIONS.CHANGE_PASSWORD_SUCCESS });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
      dispatch({ type: ACTIONS.SET_SAVING, saving: false });
    }
  }, [currentPassword, newPassword]);

  // ─── Loading State ────────────────────────────────────────────────────────

  if (isDashboardLoading || state.loading) {
    return (
      <div className="min-h-[80vh] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-64 bg-gray-200 rounded-3xl mb-8 border border-gray-100 shadow-sm" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl border border-gray-100 shadow-sm" />)}
        </div>
        <div className="h-32 bg-gray-200 rounded-2xl mb-8 border border-gray-100 shadow-sm" />
        <div className="h-80 bg-gray-200 rounded-2xl border border-gray-100 shadow-sm" />
      </div>
    );
  }

  const { user, stats, recentOrders } = dashboardData || {};
  const tier = getLoyaltyTier(stats?.totalSpent || 0);

  return (
    <div className="min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 p-8 mb-8 shadow-2xl"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative flex flex-col md:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group">
              {editMode ? (
                <div
                  className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/30 cursor-pointer hover:border-white/60 transition-all"
                  onClick={() => document.getElementById('dashboard-photo').click()}
                >
                  {photoPreview || user?.profilePhoto ? (
                    <img src={photoPreview || user?.profilePhoto} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center">
                      <User className="w-12 h-12 text-white/70" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full group-hover:bg-black/60 transition-colors backdrop-blur-[1px]">
                    <div className="flex flex-col items-center gap-1 mt-1">
                      <Camera className="w-7 h-7 text-white" />
                      <span className="text-[9px] font-bold text-white uppercase tracking-wider">Upload</span>
                    </div>
                  </div>
                  <input id="dashboard-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>
              ) : (
                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/30 shadow-xl">
                  {user?.profilePhoto ? (
                    <img src={user.profilePhoto} alt={user?.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-white/20 flex items-center justify-center">
                      <User className="w-12 h-12 text-white/70" />
                    </div>
                  )}
                </div>
              )}
              {!editMode && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-green-400 rounded-full border-[3px] border-gray-900 shadow-md" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left text-white">
              {editMode ? (
                <div className="flex flex-col gap-4 w-full max-w-md text-left mt-2 md:mt-0">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider ml-1">Display Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => dispatch({ type: ACTIONS.SET_EDIT_FIELD, field: 'editName', value: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/20 transition-all font-semibold"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-white/70 uppercase tracking-wider ml-1">Bio (Optional)</label>
                    <textarea
                      value={editBio}
                      onChange={(e) => dispatch({ type: ACTIONS.SET_EDIT_FIELD, field: 'editBio', value: e.target.value })}
                      maxLength={200}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-white/20 transition-all text-sm resize-none"
                      placeholder="Write a short bio about yourself..."
                      rows={3}
                    />
                    <div className="text-right text-[10px] text-white/50 font-medium mr-1">{editBio.length}/200</div>
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="flex-1 flex justify-center items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Profile
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => dispatch({ type: ACTIONS.CANCEL_EDIT })}
                      className="flex-1 flex justify-center items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 border border-white/10 transition-all"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </motion.button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <h1 className="text-3xl md:text-4xl font-bold">{user?.name || 'User'}</h1>
                    <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r ${tier.color} text-gray-900 text-xs font-bold shadow-lg shadow-black/20`}>
                      <Crown className="w-3.5 h-3.5" />
                      {tier.name}
                    </div>
                  </div>
                  <p className="text-white/80 text-lg mb-1">{user?.email}</p>
                  {user?.bio && <p className="text-white/70 text-sm max-w-md">{user.bio}</p>}
                  
                  {tier.next && (
                    <div className="mt-4 max-w-xs">
                      <div className="flex justify-between text-xs text-white/70 mb-1.5 font-medium">
                        <span>${stats?.totalSpent || 0} spent</span>
                        <span>${tier.next} for {getLoyaltyTier(tier.next).name}</span>
                      </div>
                      <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden border border-white/10 shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, ((stats?.totalSpent || 0) / tier.next) * 100)}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" 
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-3 mt-4 justify-center md:justify-start">
                    <span className="flex items-center gap-1.5 text-sm text-white/70 bg-white/10 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm shadow-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            {!editMode && (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => dispatch({ type: ACTIONS.TOGGLE_EDIT_MODE })}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-xl font-medium hover:bg-white/25 transition-all"
                >
                  <Edit3 className="w-4 h-4" /> Edit Profile
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => dispatch({ type: ACTIONS.TOGGLE_PASSWORD_MODE })}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-sm border border-white/20 text-white rounded-xl font-medium hover:bg-white/25 transition-all"
                >
                  <Lock className="w-4 h-4" /> Password
                </motion.button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Password Change Modal */}
        <AnimatePresence>
          {passwordMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
              onClick={() => dispatch({ type: ACTIONS.CANCEL_PASSWORD })}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-gray-800" /> Change Password
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => dispatch({ type: ACTIONS.SET_PASSWORD_FIELD, field: 'currentPassword', value: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => dispatch({ type: ACTIONS.SET_PASSWORD_FIELD, field: 'newPassword', value: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:ring-2 focus:ring-gray-200 outline-none transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-1">Min 6 chars, 1 uppercase, 1 number, 1 symbol</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch({ type: ACTIONS.CANCEL_PASSWORD })}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleChangePassword}
                    disabled={saving || !currentPassword || !newPassword}
                    className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Change
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {STAT_CARDS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className={`${stat.bg} rounded-2xl p-6 border border-white shadow-sm hover:shadow-lg transition-all`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 group-hover:text-gray-800 transition-colors">
                {stat.prefix && <span>{stat.prefix}</span>}
                <AnimatedCounter value={stats?.[stat.key] || 0} />
              </p>
              <p className="text-sm text-gray-500 font-medium mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Gamified VIP Benefits Section */}
        {!editMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-xl border border-gray-700 relative"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Crown className="w-32 h-32 text-white" />
            </div>
            <div className="relative p-6 md:p-8 z-10 flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-2">
                  <span className={`px-3 py-1 rounded-full bg-gradient-to-r ${tier.color} text-gray-900 text-xs font-black uppercase tracking-wider`}>
                    {tier.name}
                  </span>
                  Your Benefits
                </h2>
                <p className="text-gray-400 text-sm mb-6 max-w-md">
                  Enjoy exclusive perks because of your loyalty. Keep shopping to unlock the next VIP tier!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {TIER_BENEFITS[tier.name].map((benefit, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${tier.color}`}>
                        <benefit.icon className="w-4 h-4 text-gray-900" />
                      </div>
                      <span className="text-sm text-gray-200 font-medium">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              {tier.next && (
                <div className="w-full md:w-72 bg-white/5 border border-white/10 rounded-xl p-6 backdrop-blur-sm shrink-0">
                  <h3 className="text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Unlock Next</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-5 h-5 text-gray-400" />
                    <span className="text-lg font-bold text-white">{getLoyaltyTier(tier.next).name} Tier</span>
                  </div>
                  <ul className="space-y-2 mb-4">
                    {TIER_BENEFITS[getLoyaltyTier(tier.next).name].slice(0, 2).map((benefit, idx) => (
                      <li key={idx} className="text-xs text-gray-400 flex items-start gap-2">
                        <span className="text-gray-600 mt-0.5">•</span> {benefit.text}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => navigate('/collection')} className="w-full py-2 bg-white text-gray-900 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">
                    Shop to Unlock
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(action.path)}
                className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${action.colors} border rounded-xl font-medium hover:shadow-md transition-all`}
              >
                <action.icon className="w-5 h-5" /> {action.label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <button
              onClick={() => navigate('/orders')}
              className="text-sm text-gray-600 font-medium hover:text-gray-900 transition-colors"
            >
              View All →
            </button>
          </div>

          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map((order, index) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="rounded-2xl bg-white border border-gray-100 hover:border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                >
                  <div 
                    onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                    className="flex flex-col md:flex-row items-start md:items-center justify-between py-5 px-5 gap-4 cursor-pointer relative group"
                  >
                    <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-center gap-4 w-full md:w-auto relative z-10">
                      <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden p-1 shrink-0 group-hover:bg-white transition-colors">
                        {order.items?.[0]?.image?.[0] ? (
                          <img src={order.items[0].image[0]} alt="product" className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          Order #{order._id.slice(-6)}
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{order.items?.length || 0} items</span>
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex-1 w-full md:w-64 px-2 md:px-8 relative z-10">
                      <div className="flex items-center justify-between text-[10px] sm:text-xs mb-1.5">
                        <span className={`font-bold ${order.status !== 'Pending' ? 'text-blue-600' : 'text-gray-400'}`}>Processing</span>
                        <span className={`font-bold ${['Shipped', 'Out for delivery', 'Delivered'].includes(order.status) ? 'text-blue-600' : 'text-gray-400'}`}>Shipped</span>
                        <span className={`font-bold ${order.status === 'Delivered' ? 'text-green-600' : 'text-gray-400'}`}>Delivered</span>
                      </div>
                      <div className="relative w-full h-1.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: order.status === 'Delivered' ? '100%' : ['Shipped', 'Out for delivery'].includes(order.status) ? '50%' : '15%' }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                          className={`absolute top-0 left-0 h-full rounded-full ${order.status === 'Delivered' ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-gradient-to-r from-blue-400 to-indigo-500'}`} 
                        />
                      </div>
                    </div>

                    <div className="text-right w-full md:w-auto flex flex-row md:flex-col justify-between items-center md:items-end relative z-10">
                      <p className="text-base font-bold text-gray-900">${order.amount}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${
                          order.status === 'Delivered' ? 'bg-green-50 text-green-600' :
                          ['Shipped', 'Out for delivery'].includes(order.status) ? 'bg-blue-50 text-blue-600' :
                          'bg-orange-50 text-orange-600'
                        }`}>
                          {order.status === 'Delivered' ? <CheckCircle2 className="w-3 h-3" /> : ['Shipped', 'Out for delivery'].includes(order.status) ? <Truck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {order.status}
                        </div>
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedOrder === order._id ? 'rotate-180' : ''}`} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Expandable Order Details */}
                  <AnimatePresence>
                    {expandedOrder === order._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-gray-100 bg-gray-50/50"
                      >
                        <div className="p-5 flex flex-col gap-3">
                          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Items in this order</h4>
                          {order.items?.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                              <img src={item.image?.[0]} alt={item.name} className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                                <p className="text-xs text-gray-500">Qty: {item.quantity} {item.size ? `• Size: ${item.size}` : ''}</p>
                              </div>
                              <p className="text-sm font-bold text-gray-900">${item.price}</p>
                            </div>
                          ))}
                          <div className="flex justify-end mt-2">
                            <button onClick={() => navigate('/orders')} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                              Track full order <TrendingUp className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-4">You haven't placed any orders yet</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/collection')}
                className="px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold shadow-lg hover:bg-gray-800 transition-all"
              >
                Start Shopping
              </motion.button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
