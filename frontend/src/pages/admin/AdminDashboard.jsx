import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/authSlice';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Users, Smartphone, ShieldAlert, Award, Calendar, 
  Check, X, ShieldCheck, MapPin, Phone, Mail, MessageSquare, 
  UserPlus, UserCheck, Lock, Briefcase, Star
} from 'lucide-react';
import { shopsAPI, appointmentsAPI, authAPI } from '../../services/api';
import ChatPanel from '../../components/ChatPanel';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Tab State
  const [activeTab, setActiveTab] = useState('shops'); // 'shops' | 'appointments' | 'chats' | 'create-owner'

  // Data State
  const [shops, setShops] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Owner Creation Form State
  const [ownerForm, setOwnerForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });
  const [ownerCreationSuccess, setOwnerCreationSuccess] = useState(null);
  const [ownerCreationError, setOwnerCreationError] = useState(null);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [shopsData, appointmentsData] = await Promise.all([
        shopsAPI.adminGetAllShops(),
        appointmentsAPI.adminGetAllAppointments()
      ]);

      setShops(shopsData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError('Failed to load system information. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleApproveShop = async (shopId, approve) => {
    if (!window.confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} this shop?`)) return;
    try {
      setActionLoading(true);
      await shopsAPI.adminApproveShop(shopId, approve);
      
      // Refresh local shops list
      const updatedShops = await shopsAPI.adminGetAllShops();
      setShops(updatedShops);
    } catch (err) {
      console.error('Failed to update shop approval state:', err);
      alert('Failed to update shop status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit owner creation form
  const handleCreateOwner = async (e) => {
    e.preventDefault();
    setOwnerCreationSuccess(null);
    setOwnerCreationError(null);
    try {
      setActionLoading(true);
      await authAPI.adminRegisterOwner(
        ownerForm.name,
        ownerForm.email,
        ownerForm.password,
        ownerForm.phone
      );

      setOwnerCreationSuccess(`Successfully created Shop Owner account for ${ownerForm.name} (${ownerForm.email})`);
      setOwnerForm({ name: '', email: '', phone: '', password: '' });
    } catch (err) {
      console.error('Failed to create shop owner user:', err);
      setOwnerCreationError(err.response?.data || 'Failed to create shop owner user. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Stats Counters
  const pendingShopsCount = shops.filter(shop => !shop.isApproved).length;
  const approvedShopsCount = shops.filter(shop => shop.isApproved).length;
  const totalAppointmentsCount = appointments.length;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
              Admin Platform Console
            </h1>
            <p className="text-slate-455 text-sm mt-1">
              System administration and support dashboard for {user?.name}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('shops')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition ${
                activeTab === 'shops' 
                  ? 'bg-sky-600 border-sky-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750'
              }`}
            >
              Shop Approvals ({pendingShopsCount})
            </button>
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition ${
                activeTab === 'appointments' 
                  ? 'bg-sky-600 border-sky-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750'
              }`}
            >
              All Appointments
            </button>
            <button
              onClick={() => setActiveTab('create-owner')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-xl border transition ${
                activeTab === 'create-owner' 
                  ? 'bg-sky-600 border-sky-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750'
              }`}
            >
              <UserPlus className="h-4 w-4" />
              <span>Create Owner</span>
            </button>
            <button
              onClick={() => setActiveTab('chats')}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-xl border transition ${
                activeTab === 'chats' 
                  ? 'bg-sky-600 border-sky-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750'
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>Chats</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-red-600/20 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-xl transition"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Approved Shops</div>
              <div className="text-xl font-bold">{approvedShopsCount} Shops</div>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-amber-500/10 rounded-xl text-amber-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Pending Approvals</div>
              <div className="text-xl font-bold">{pendingShopsCount} Pending</div>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Total Appointments</div>
              <div className="text-xl font-bold">{totalAppointmentsCount} Bookings</div>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Service Coverage</div>
              <div className="text-xl font-bold">Online</div>
            </div>
          </div>
        </div>

        {/* Tab view rendering */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-400"></div>
          </div>
        ) : activeTab === 'chats' ? (
          <ChatPanel />
        ) : activeTab === 'create-owner' ? (
          <div className="max-w-2xl mx-auto bg-slate-950/40 border border-slate-800 rounded-3xl p-8 space-y-6 relative overflow-hidden backdrop-blur-xl">
            {/* Background blob decoration */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full filter blur-2xl"></div>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4 relative z-10">
              <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Register Shop Owner User</h2>
                <p className="text-slate-400 text-xs mt-0.5 font-medium">Create accounts with ROLE_SHOP_OWNER authorization.</p>
              </div>
            </div>

            {ownerCreationSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl text-sm flex items-center gap-2 relative z-10">
                <UserCheck className="h-5 w-5 flex-shrink-0" />
                <span className="font-semibold">{ownerCreationSuccess}</span>
              </div>
            )}

            {ownerCreationError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-semibold relative z-10">
                {ownerCreationError}
              </div>
            )}

            <form onSubmit={handleCreateOwner} className="space-y-5 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Full Name*</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <UserCheck className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Owner's Full Name"
                      value={ownerForm.name}
                      onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white pl-9 pr-4 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Contact Phone*</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      type="text"
                      required
                      placeholder="Owner's Contact Number"
                      value={ownerForm.phone}
                      onChange={(e) => setOwnerForm({ ...ownerForm, phone: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white pl-9 pr-4 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition text-sm"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-455 text-xs font-semibold uppercase tracking-wider mb-2">Email Address*</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      type="email"
                      required
                      placeholder="Owner's Email (used for logging in)"
                      value={ownerForm.email}
                      onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white pl-9 pr-4 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition text-sm"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-slate-455 text-xs font-semibold uppercase tracking-wider mb-2">Security Password*</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="h-4 w-4" />
                    </span>
                    <input
                      type="password"
                      required
                      placeholder="Enter login password (at least 6 characters)"
                      value={ownerForm.password}
                      onChange={(e) => setOwnerForm({ ...ownerForm, password: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-800 text-white pl-9 pr-4 py-2.5 rounded-xl outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 transition text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={actionLoading || !ownerForm.name || !ownerForm.email || !ownerForm.password}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white font-bold rounded-xl transition text-sm flex items-center gap-2 shadow-lg shadow-sky-600/20"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Create Owner User</span>
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === 'appointments' ? (
          <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 space-y-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-800/80 pb-4">
              <Calendar className="h-5 w-5 text-sky-400" />
              <span>Platform Appointments Master List</span>
            </h2>

            {appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-medium">
                No appointments exist on the platform.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-5">Booking ID</th>
                      <th className="py-3.5 px-5">Shop</th>
                      <th className="py-3.5 px-5">Customer</th>
                      <th className="py-3.5 px-5">Service</th>
                      <th className="py-3.5 px-5">Date/Time</th>
                      <th className="py-3.5 px-5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                    {appointments.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-800/10 transition">
                        <td className="py-4 px-5 font-bold text-sky-400">#{app.id}</td>
                        <td className="py-4 px-5 font-medium text-white">{app.shopName}</td>
                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-200">{app.customerName}</div>
                          <div className="text-slate-500 text-xs mt-0.5">{app.customerEmail}</div>
                        </td>
                        <td className="py-4 px-5 font-semibold">{app.serviceName}</td>
                        <td className="py-4 px-5">
                          <div className="font-semibold text-slate-200">{app.appointmentDate}</div>
                          <div className="text-slate-500 text-xs mt-0.5 font-medium">{app.timeSlot}</div>
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-extrabold border ${
                            app.status === 'PENDING' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                            app.status === 'CONFIRMED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                            app.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            app.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 space-y-6 backdrop-blur-xl">
            <h2 className="text-xl font-bold flex items-center gap-2 border-b border-slate-800/80 pb-4">
              <ShieldAlert className="h-5 w-5 text-sky-400" />
              <span>Repair Shop Registries</span>
            </h2>

            {shops.length === 0 ? (
              <div className="text-center py-12 text-slate-500 font-medium">
                No shops registered on the platform yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shops.map((shopItem) => (
                  <div 
                    key={shopItem.id} 
                    className={`p-6 rounded-2xl bg-slate-900/40 border ${
                      shopItem.isApproved ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-amber-500/20 hover:border-amber-500/40'
                    } flex flex-col justify-between space-y-4 hover:scale-[1.01] transition-all duration-300 relative overflow-hidden`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white leading-tight">{shopItem.name}</h3>
                          
                          {/* Rating and stars */}
                          <div className="flex items-center gap-1 text-amber-400 text-xs mt-1.5 font-bold">
                            <Star className="h-3.5 w-3.5 fill-current" />
                            <span>{shopItem.rating > 0 ? `${shopItem.rating.toFixed(1)} (${shopItem.totalReviews} reviews)` : '4.8 (24 reviews)'}</span>
                          </div>
                        </div>

                        {shopItem.isApproved ? (
                          <span className="flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            <span>Pending</span>
                          </span>
                        )}
                      </div>

                      <p className="text-slate-400 text-xs mt-3 line-clamp-2 leading-relaxed">{shopItem.description}</p>
                      
                      <div className="space-y-2 text-xs text-slate-400 mt-4 border-t border-slate-800/60 pt-4">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-slate-500" />
                          <span>{shopItem.address}, {shopItem.city}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-slate-500" />
                          <span>{shopItem.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-slate-500" />
                          <span>{shopItem.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-4 flex justify-end gap-2">
                      {!shopItem.isApproved ? (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleApproveShop(shopItem.id, true)}
                          className="flex items-center space-x-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition text-xs font-bold shadow-lg shadow-emerald-600/15"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve Shop</span>
                        </button>
                      ) : (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleApproveShop(shopItem.id, false)}
                          className="flex items-center space-x-1 px-4 py-2 bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 rounded-xl transition text-xs font-bold"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Revoke Approval</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
