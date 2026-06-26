import { useState, useReducer, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router';
import {
  Users, Package, Star, TrendingUp, Trash2, Shield, Search,
  Loader2, AlertTriangle, Crown, Clock, Eye, BarChart3,
  UserPlus, ShoppingBag, ShieldCheck, ShieldOff, Activity, DollarSign
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend
} from 'recharts';
import {
  useGetDashboardStatsQuery,
  useGetDashboardUsersQuery,
  useGetDashboardChartStatsQuery,
  useUpdateUserRoleMutation,
  useDeleteUserMutation,
  useDeleteProductAdminMutation,
} from '../redux/api/dashboardApiSlice';

// ─── Reducer ────────────────────────────────────────────────────────────────────

const ACTIONS = {
  SET_TAB: 'SET_TAB',
  SET_SEARCH: 'SET_SEARCH', SET_MESSAGE: 'SET_MESSAGE', CLEAR_MESSAGE: 'CLEAR_MESSAGE',
  OPEN_DELETE: 'OPEN_DELETE', CLOSE_DELETE: 'CLOSE_DELETE', SET_DELETING: 'SET_DELETING',
};

const initial = {
  activeTab: 'overview', searchQuery: '',
  deleteModal: { show: false, type: '', id: '', name: '' },
  deleting: false, message: { type: '', text: '' },
};

const reducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_TAB: return { ...state, activeTab: action.tab };
    case ACTIONS.SET_SEARCH: return { ...state, searchQuery: action.query };
    case ACTIONS.SET_MESSAGE: return { ...state, message: { type: action.msgType, text: action.text } };
    case ACTIONS.CLEAR_MESSAGE: return { ...state, message: { type: '', text: '' } };
    case ACTIONS.OPEN_DELETE: return { ...state, deleteModal: { show: true, type: action.entityType, id: action.id, name: action.name } };
    case ACTIONS.CLOSE_DELETE: return { ...state, deleteModal: { show: false, type: '', id: '', name: '' }, deleting: false };
    case ACTIONS.SET_DELETING: return { ...state, deleting: action.deleting };
    default: return state;
  }
};

// ─── Config ─────────────────────────────────────────────────────────────────────

const CHART_COLORS = ['#6366f1', '#06b6d4', '#f59e0b', '#10b981', '#ef4444'];
const TABS = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'statistics', label: 'Statistics', icon: Activity },
  { id: 'users', label: 'Users', icon: Users },
];

const STAT_CARDS = [
  { label: 'Total Users', key: 'totalUsers', trendKey: 'newUsersThisWeek', trendLabel: 'this week', icon: Users, gradient: 'from-blue-600 to-indigo-600' },
  { label: 'Total Products', key: 'totalProducts', trendKey: 'newProductsThisWeek', trendLabel: 'this week', icon: Package, gradient: 'from-emerald-600 to-teal-600' },
  { label: 'Total Orders', key: 'totalOrders', trendKey: 'newOrdersThisWeek', trendLabel: 'this week', icon: ShoppingBag, gradient: 'from-purple-600 to-pink-600' },
  { label: 'Revenue', key: 'totalRevenue', trendKey: null, icon: DollarSign, gradient: 'from-orange-600 to-amber-600', prefix: '$' },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 shadow-2xl">
      <p className="text-slate-300 text-xs font-medium mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-bold" style={{ color: entry.color }}>{entry.name}: {entry.value}</p>
      ))}
    </div>
  );
};

const UserAvatar = ({ user }) => {
  if (user?.profilePhoto) {
    return <img src={user.profilePhoto} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-600" />;
  }
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
    </div>
  );
};

const AnimatedCounter = ({ value }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0; const end = value; if (start === end) return;
    const inc = end / 90;
    const timer = setInterval(() => { start += inc; if (start >= end) { setCount(end); clearInterval(timer); } else setCount(Math.floor(start)); }, 1000/60);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{typeof value === 'number' && value % 1 !== 0 ? count.toFixed(1) : count}</span>;
};



// ─── Main Component ─────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [state, dispatch] = useReducer(reducer, initial);
  const navigate = useNavigate();
  const { activeTab, searchQuery, deleteModal, deleting, message } = state;

  const { data: stats, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: users = [], isLoading: usersLoading } = useGetDashboardUsersQuery();
  const { data: chartData, isLoading: chartLoading } = useGetDashboardChartStatsQuery();

  const [updateRole] = useUpdateUserRoleMutation();
  const [deleteUserMut] = useDeleteUserMutation();
  const [deleteProductMut] = useDeleteProductAdminMutation();

  const loading = statsLoading || usersLoading || chartLoading;

  const showMessage = useCallback((t, text) => {
    dispatch({ type: ACTIONS.SET_MESSAGE, msgType: t, text });
    setTimeout(() => dispatch({ type: ACTIONS.CLEAR_MESSAGE }), 3000);
  }, []);

  const handleRoleChange = useCallback(async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateRole({ userId, role: newRole }).unwrap();
      showMessage('success', `User role updated to "${newRole}"`);
    } catch (err) { showMessage('error', err?.data?.message || err.message || 'Failed to update role'); }
  }, [showMessage, updateRole]);

  const handleDelete = useCallback(async () => {
    dispatch({ type: ACTIONS.SET_DELETING, deleting: true });
    try {
      if (deleteModal.type === 'user') {
        await deleteUserMut(deleteModal.id).unwrap();
      } else {
        await deleteProductMut(deleteModal.id).unwrap();
      }
      dispatch({ type: ACTIONS.CLOSE_DELETE });
      showMessage('success', `${deleteModal.type === 'user' ? 'User' : 'Product'} deleted`);
    } catch (err) { 
      showMessage('error', err?.data?.message || err.message || 'Delete failed'); 
      dispatch({ type: ACTIONS.CLOSE_DELETE }); 
    }
  }, [deleteModal, showMessage, deleteUserMut, deleteProductMut]);

  const filteredUsers = useMemo(() =>
    users.filter(u => u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())),
    [users, searchQuery]
  );

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Loader2 className="w-12 h-12 text-purple-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 -m-8 p-8">
      {/* Toast */}
      <AnimatePresence>
        {message.text && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-20 right-4 z-50 px-6 py-3 rounded-xl shadow-xl font-medium ${message.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
            {message.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg shadow-purple-500/20">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-slate-400">Manage your platform</p>
          </div>
        </div>
        <div className="flex bg-slate-800/80 rounded-2xl p-1.5 border border-slate-700/50">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => dispatch({ type: ACTIONS.SET_TAB, tab: tab.id })}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>
              <tab.icon className="w-4 h-4" />{tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Overview Tab ── */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {STAT_CARDS.map((card, i) => (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} whileHover={{ y: -4 }}
                className="relative overflow-hidden bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 hover:border-slate-600/50 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  {card.trendKey && stats?.[card.trendKey] > 0 && (
                    <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold">
                      <TrendingUp className="w-3 h-3" />
                      +{stats[card.trendKey]} {card.trendLabel}
                    </div>
                  )}
                </div>
                <p className="text-3xl font-bold text-white mb-1">
                  {card.prefix || ''}<AnimatedCounter value={stats?.[card.key] || 0} />
                </p>
                <p className="text-sm text-slate-400 font-medium">{card.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Orders */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Recent Orders</h3>
              </div>
              {stats?.recentOrders?.length > 0 ? (
                <div className="space-y-3">
                  {stats.recentOrders.map((order, i) => (
                    <motion.div key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * i }}
                      className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Order #{order._id?.slice(-6)}</p>
                          <p className="text-xs text-slate-400">{new Date(order.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-emerald-400">${order.amount}</p>
                        <p className={`text-xs font-medium ${order.status === 'Delivered' ? 'text-green-400' : 'text-orange-400'}`}>{order.status}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : <p className="text-slate-500 text-center py-8">No orders yet</p>}
            </motion.div>

            {/* Top Rated Products */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-5">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="text-lg font-bold text-white">Top Rated Products</h3>
              </div>
              {stats?.topRatedProducts?.length > 0 ? (
                <div className="space-y-3">
                  {stats.topRatedProducts.map((product, i) => (
                    <motion.div key={product._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 * i }}
                      className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {product.image?.[0] ? (
                          <img src={product.image[0]} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-600 flex items-center justify-center">
                            <Package className="w-5 h-5 text-slate-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-medium text-white truncate max-w-[150px]">{product.name}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                            <span className="text-xs text-slate-300 font-medium">{product.averageRating?.toFixed(1)} <span className="text-slate-500">({product.totalRatings})</span></span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-white">${product.price}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : <p className="text-slate-500 text-center py-8">No rated products</p>}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* ── Statistics Tab ── */}
      {activeTab === 'statistics' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {chartData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {chartData.weeklyTrends && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-lg"><TrendingUp className="w-4 h-4 text-white" /></div>
                    <h3 className="text-lg font-bold text-white">Weekly Trends</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.weeklyTrends}>
                        <defs>
                          <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="week" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="users" name="Users" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#colorUsers)" />
                        <Area type="monotone" dataKey="orders" name="Orders" stroke="#06b6d4" strokeWidth={2.5} fill="url(#colorOrders)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
              {chartData.categoryData && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-lg"><BarChart3 className="w-4 h-4 text-white" /></div>
                    <h3 className="text-lg font-bold text-white">Products by Category</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.categoryData} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="count" name="Products" radius={[8, 8, 0, 0]}>
                          {chartData.categoryData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {/* Monthly Revenue Chart */}
              {chartData.monthlyData && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg"><DollarSign className="w-4 h-4 text-white" /></div>
                    <h3 className="text-lg font-bold text-white">Monthly Revenue Growth</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData.monthlyData}>
                        <defs>
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                        <YAxis stroke="#64748b" fontSize={11} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={2.5} fill="url(#colorRevenue)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}

              {/* Rating Distribution Donut Chart */}
              {chartData.ratingData && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                  className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <div className="p-2 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg"><Star className="w-4 h-4 text-white fill-white" /></div>
                    <h3 className="text-lg font-bold text-white">Rating Distribution</h3>
                  </div>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px', color: '#cbd5e1', paddingTop: '20px' }} />
                        <Pie data={chartData.ratingData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="count" nameKey="rating" stroke="none">
                          {chartData.ratingData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
          )}
        </motion.div>
      )}

      {/* ── Users Tab ── */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input type="text" placeholder="Search users..." value={searchQuery}
              onChange={(e) => dispatch({ type: ACTIONS.SET_SEARCH, query: e.target.value })}
              className="w-full pl-12 pr-4 py-3.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 transition-all" />
          </div>
          <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                      <th key={h} className={`px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/30">
                  {filteredUsers.map((user, i) => (
                    <motion.tr key={user._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }} className="hover:bg-slate-700/20 transition-colors">
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><UserAvatar user={user} /><span className="text-sm font-medium text-white">{user.name || 'Unnamed'}</span></div></td>
                      <td className="px-6 py-4 text-sm text-slate-300">{user.email}</td>
                      <td className="px-6 py-4"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-600/30 text-slate-400'}`}>{user.role}</span></td>
                      <td className="px-6 py-4 text-sm text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRoleChange(user._id, user.role)}
                            className={`p-2 rounded-lg transition-all ${user.role === 'admin' ? 'text-purple-400 hover:text-orange-400 hover:bg-orange-500/10' : 'text-slate-400 hover:text-purple-400 hover:bg-purple-500/10'}`}>
                            {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </motion.button>
                          {user.role !== 'admin' && (
                            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                              onClick={() => dispatch({ type: ACTIONS.OPEN_DELETE, entityType: 'user', id: user._id, name: user.name || user.email })}
                              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                              <Trash2 className="w-4 h-4" />
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12"><Users className="w-12 h-12 text-slate-600 mx-auto mb-3" /><p className="text-slate-500">No users found</p></div>
            )}
          </div>
        </motion.div>
      )}

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteModal.show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => dispatch({ type: ACTIONS.CLOSE_DELETE })}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center"><AlertTriangle className="w-8 h-8 text-red-400" /></div>
              </div>
              <h3 className="text-xl font-bold text-white text-center mb-2">Delete {deleteModal.type === 'user' ? 'User' : 'Product'}?</h3>
              <p className="text-slate-400 text-center mb-2"><span className="text-white font-medium">{deleteModal.name}</span></p>
              <p className="text-sm text-slate-500 text-center mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => dispatch({ type: ACTIONS.CLOSE_DELETE })} disabled={deleting}
                  className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl font-medium hover:bg-slate-600 transition-colors disabled:opacity-50">Cancel</button>
                <button onClick={handleDelete} disabled={deleting}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
