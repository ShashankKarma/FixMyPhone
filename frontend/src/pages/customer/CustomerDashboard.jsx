import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/authSlice';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, User, Smartphone, Calendar, FileText, 
  MessageSquare, Clock, MapPin, MessageCircle, AlertCircle
} from 'lucide-react';
import { appointmentsAPI, chatAPI } from '../../services/api';
import ChatPanel from '../../components/ChatPanel';

const CustomerDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Tab State
  const [activeTab, setActiveTab] = useState('repairs'); // 'repairs' | 'chats'

  // Data State
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCustomerData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentsAPI.getCustomerAppointments();
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch customer appointments:', err);
      setError('Failed to load appointments. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const handleInitiateChat = async (shopId) => {
    try {
      setActionLoading(true);
      // Initiate room with this shop
      await chatAPI.initiateChat(shopId);
      // Switch tab to chats
      setActiveTab('chats');
    } catch (err) {
      console.error('Failed to initiate chat room:', err);
      alert('Failed to open chat with this shop. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics
  const activeRepairsCount = appointments.filter(app => app.status !== 'CANCELLED' && app.status !== 'COMPLETED').length;
  const completedRepairsCount = appointments.filter(app => app.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
              Customer Portal
            </h1>
            <p className="text-slate-450 text-sm mt-1">
              Welcome back, {user?.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('repairs')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition ${
                activeTab === 'repairs' 
                  ? 'bg-sky-600 border-sky-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750'
              }`}
            >
              My Repairs ({appointments.length})
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
              <span>Support Chats</span>
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

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Active Repairs</div>
              <div className="text-xl font-bold">{activeRepairsCount} Active</div>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
              <Smartphone className="h-6 w-6" />
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Completed Repairs</div>
              <div className="text-xl font-bold">{completedRepairsCount} Done</div>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Account Level</div>
              <div className="text-xl font-bold">Standard</div>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
              <User className="h-6 w-6" />
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">User Role</div>
              <div className="text-xl font-bold">Customer</div>
            </div>
          </div>
        </div>

        {/* Tab content rendering */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sky-400"></div>
          </div>
        ) : activeTab === 'chats' ? (
          <ChatPanel />
        ) : (
          <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-sky-400" />
                <span>My Booked Repair Appointments</span>
              </h2>
              <button
                onClick={() => navigate('/book/1')}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-sky-655/10"
              >
                Book New Repair
              </button>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-12 text-slate-500 space-y-4">
                <AlertCircle className="h-8 w-8 text-slate-655 mx-auto" />
                <div>You have no repair appointments scheduled.</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {appointments.map((app) => (
                  <div 
                    key={app.id} 
                    className={`p-5 rounded-2xl bg-slate-900/60 border ${
                      app.status === 'PENDING' ? 'border-sky-500/30' : 
                      app.status === 'CONFIRMED' ? 'border-indigo-500/30' :
                      app.status === 'IN_PROGRESS' ? 'border-amber-500/30' :
                      app.status === 'COMPLETED' ? 'border-emerald-500/30' : 'border-slate-850'
                    } flex flex-col justify-between space-y-4`}
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold text-white">{app.serviceName}</h3>
                          <p className="text-sky-400 text-xs font-semibold">{app.shopName}</p>
                        </div>
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-bold border ${
                          app.status === 'PENDING' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                          app.status === 'CONFIRMED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          app.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          app.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-400 mt-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-sky-500" />
                          <span>Date: {app.appointmentDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-sky-500" />
                          <span>Slot: {app.timeSlot}</span>
                        </div>
                      </div>

                      {app.notes && (
                        <div className="mt-3 p-3 bg-slate-950/40 border border-slate-800 rounded-xl text-xxs text-slate-450">
                          <span className="font-semibold text-slate-350">My Note: </span>{app.notes}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-slate-850 pt-3 flex items-center justify-end">
                      <button
                        disabled={actionLoading}
                        onClick={() => handleInitiateChat(app.shopId)}
                        className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-sky-600/20 hover:text-sky-400 border border-slate-700 hover:border-sky-500/35 rounded-xl transition text-xs font-semibold"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                        <span>Chat with Shop</span>
                      </button>
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

export default CustomerDashboard;
