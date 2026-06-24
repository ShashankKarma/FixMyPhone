import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/authSlice';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Users, Smartphone, ShieldAlert, Award, Calendar, 
  Check, X, ShieldCheck, MapPin, Phone, Mail, MessageSquare, 
  UserPlus, UserCheck, Lock, Briefcase
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
          <div className="max-w-2xl mx-auto bg-slate-950/40 border border-slate-800 rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400">
                <UserPlus className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Register Shop Owner User</h2>
                <p className="text-slate-400 text-xs mt-0.5">Use this console to create accounts with ROLE_SHOP_OWNER permission.</p>
              </div>
            </div>

            {ownerCreationSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 p-4 rounded-xl text-sm flex items-center gap-2">
                <UserCheck className="h-5 w-5 flex-shrink-0" />
                <span>{ownerCreationSuccess}</span>
              </div>
            )}

            {ownerCreationError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
                {ownerCreationError}
              </div>
            )}

            <form onSubmit={handleCreateOwner} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-450 text-xs font-bold uppercase tracking-wider mb-1">Full Name*</label>
                  <input
                    type="text"
                    required
                    placeholder="Owner's Full Name"
                    value={ownerForm.name}
                    onChange={(e) => setOwnerForm({ ...ownerForm, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-sky-500 transition text-sm"
                  />
                </div>
                <div>
                  <label className="block text-slate-455 text-xs font-bold uppercase tracking-wider mb-1">Contact Phone*</label>
                  <input
                    type="text"
                    required
                    placeholder="Owner's Contact Number"
                    value={ownerForm.phone}
                    onChange={(e) => setOwnerForm({ ...ownerForm, phone: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-sky-500 transition text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-455 text-xs font-bold uppercase tracking-wider mb-1">Email Address*</label>
                  <input
                    type="email"
                    required
                    placeholder="Owner's Email (used for logging in)"
                    value={ownerForm.email}
                    onChange={(e) => setOwnerForm({ ...ownerForm, email: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-sky-500 transition text-sm"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-455 text-xs font-bold uppercase tracking-wider mb-1">Security Password*</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter login password (at least 6 characters)"
                    value={ownerForm.password}
                    onChange={(e) => setOwnerForm({ ...ownerForm, password: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-sky-500 transition text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={actionLoading || !ownerForm.name || !ownerForm.email || !ownerForm.password}
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white font-bold rounded-xl transition text-sm flex items-center gap-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Create Owner User</span>
                </button>
              </div>
            </form>
          </div>
        ) : activeTab === 'appointments' ? (
          <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-sky-400" />
              <span>Platform Appointments Master List</span>
            </h2>

            {appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No appointments exist on the platform.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Booking ID</th>
                      <th className="py-3 px-4">Shop</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Date/Time</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-sm text-slate-300">
                    {appointments.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-800/10 transition">
                        <td className="py-4 px-4 font-bold text-sky-455">#{app.id}</td>
                        <td className="py-4 px-4 font-medium text-white">{app.shopName}</td>
                        <td className="py-4 px-4">
                          <div>{app.customerName}</div>
                          <div className="text-slate-500 text-xs">{app.customerEmail}</div>
                        </td>
                        <td className="py-4 px-4">{app.serviceName}</td>
                        <td className="py-4 px-4">
                          <div>{app.appointmentDate}</div>
                          <div className="text-slate-550 text-xxs">{app.timeSlot}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-bold border ${
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
          <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-sky-400" />
              <span>Repair Shop Registries</span>
            </h2>

            {shops.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                No shops registered on the platform yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shops.map((shopItem) => (
                  <div 
                    key={shopItem.id} 
                    className={`p-5 rounded-2xl bg-slate-900/60 border ${
                      shopItem.isApproved ? 'border-emerald-500/20' : 'border-amber-500/30'
                    } flex flex-col justify-between space-y-4`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-white">{shopItem.name}</h3>
                        {shopItem.isApproved ? (
                          <span className="flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            <span>Approved</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 px-2.5 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-semibold rounded-full border border-amber-500/20">
                            <ShieldAlert className="h-3.5 w-3.5" />
                            <span>Pending Approval</span>
                          </span>
                        )}
                      </div>

                      <p className="text-slate-400 text-xs mt-2 line-clamp-2">{shopItem.description}</p>
                      
                      <div className="space-y-1.5 text-xs text-slate-400 mt-4">
                        <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-slate-500" />{shopItem.address}, {shopItem.city}</div>
                        <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-500" />{shopItem.phone}</div>
                        <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-slate-500" />{shopItem.email}</div>
                      </div>
                    </div>

                    <div className="border-t border-slate-800/80 pt-3 flex justify-end gap-2">
                      {!shopItem.isApproved ? (
                        <>
                          <button
                            disabled={actionLoading}
                            onClick={() => handleApproveShop(shopItem.id, true)}
                            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition text-xs font-bold"
                          >
                            <Check className="h-3.5 w-3.5" />
                            <span>Approve Shop</span>
                          </button>
                        </>
                      ) : (
                        <button
                          disabled={actionLoading}
                          onClick={() => handleApproveShop(shopItem.id, false)}
                          className="flex items-center space-x-1 px-3 py-1.5 bg-rose-600/10 hover:bg-rose-600/25 text-rose-455 border border-rose-500/35 rounded-xl transition text-xs font-bold"
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
