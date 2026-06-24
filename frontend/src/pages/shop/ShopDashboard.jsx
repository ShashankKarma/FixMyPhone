import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/authSlice';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, Wrench, Calendar, DollarSign, Star, Clock, User, Phone, 
  Mail, FileText, Check, X, ShieldAlert, Plus, Trash2, ShieldCheck, 
  MapPin, PenTool, Play, MessageSquare
} from 'lucide-react';
import { shopsAPI, appointmentsAPI } from '../../services/api';
import ChatPanel from '../../components/ChatPanel';

const ShopDashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  // Tab State
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'chats'

  // Shop Owner State
  const [shop, setShop] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasNoShop, setHasNoShop] = useState(false);

  // Form State for creating a shop
  const [shopForm, setShopForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    latitude: 0,
    longitude: 0
  });

  // Form State for adding a service
  const [showAddService, setShowAddService] = useState(false);
  const [serviceForm, setServiceForm] = useState({
    name: '',
    customName: '',
    price: '',
    durationMinutes: '',
    isAvailable: true
  });

  const [actionLoading, setActionLoading] = useState(false);

  // Load shop, appointments, and services data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 1. Get my shop details
      const shopData = await shopsAPI.getMyShop();
      setShop(shopData);
      setHasNoShop(false);

      // 2. Fetch appointments and services
      const [appointmentsData, servicesData] = await Promise.all([
        appointmentsAPI.getShopAppointments(shopData.id),
        shopsAPI.getServicesByShop(shopData.id, false)
      ]);

      setAppointments(appointmentsData);
      setServices(servicesData);

    } catch (err) {
      console.error('Error loading dashboard data:', err);
      if (err.response && err.response.status === 404) {
        setHasNoShop(true);
      } else {
        setError('Failed to load dashboard data. Please refresh the page.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  // Create Shop Handler
  const handleCreateShop = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await shopsAPI.createShop(shopForm);
      await loadDashboardData();
    } catch (err) {
      console.error('Error creating shop:', err);
      setError(err.response?.data?.message || 'Failed to create shop. Please check details.');
      setLoading(false);
    }
  };

  // Add Service Handler
  const handleAddService = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        ...serviceForm,
        price: 0.0,
        durationMinutes: parseInt(serviceForm.durationMinutes)
      };
      await shopsAPI.addService(payload);
      setShowAddService(false);
      setServiceForm({ name: '', customName: '', price: '', durationMinutes: '', isAvailable: true });
      // Refresh shop data
      const updatedServices = await shopsAPI.getServicesByShop(shop.id, false);
      setServices(updatedServices);
    } catch (err) {
      console.error('Error adding service:', err);
      alert('Failed to add service. Please check details.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Service Handler
  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      setActionLoading(true);
      await shopsAPI.deleteService(serviceId);
      const updatedServices = await shopsAPI.getServicesByShop(shop.id, false);
      setServices(updatedServices);
    } catch (err) {
      console.error('Error deleting service:', err);
      alert('Failed to delete service.');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Appointment Status Handler
  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      setActionLoading(true);
      await appointmentsAPI.updateAppointmentStatus(appointmentId, newStatus);
      // Refresh appointments
      const updatedAppointments = await appointmentsAPI.getShopAppointments(shop.id);
      setAppointments(updatedAppointments);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  // Metrics computation
  const activeBookingsCount = appointments.filter(app => app.status !== 'CANCELLED').length;
  const completedBookingsCount = appointments.filter(app => app.status === 'COMPLETED').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  // SHOP REGISTRATION VIEW (If user has no shop yet)
  if (hasNoShop) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-slate-950/50 border border-slate-800 rounded-3xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight">Register Your Repair Shop</h1>
            <p className="text-slate-400 text-sm">
              Please register your shop details to start receiving repair and appointment requests.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateShop} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase">Shop Name*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Quick Fix Mobiles"
                  value={shopForm.name}
                  onChange={(e) => setShopForm({ ...shopForm, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-sky-500 transition text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase">Contact Number*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +1 555-0199"
                  value={shopForm.phone}
                  onChange={(e) => setShopForm({ ...shopForm, phone: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-sky-500 transition text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase">Email Address*</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. contact@quickfix.com"
                  value={shopForm.email}
                  onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-sky-500 transition text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase">Street Address*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 102 Main Street"
                  value={shopForm.address}
                  onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-sky-500 transition text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase">City*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chicago"
                  value={shopForm.city}
                  onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-sky-500 transition text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase">State*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IL"
                  value={shopForm.state}
                  onChange={(e) => setShopForm({ ...shopForm, state: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-sky-500 transition text-sm"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase">Zip Code*</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 60601"
                  value={shopForm.zipCode}
                  onChange={(e) => setShopForm({ ...shopForm, zipCode: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white px-4 py-2.5 rounded-xl outline-none focus:border-sky-500 transition text-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-slate-400 text-xs font-semibold mb-1 uppercase">Shop Description</label>
                <textarea
                  rows="3"
                  placeholder="Introduce your shop services, specialties, etc..."
                  value={shopForm.description}
                  onChange={(e) => setShopForm({ ...shopForm, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 text-white p-4 rounded-xl outline-none focus:border-sky-500 transition text-sm"
                ></textarea>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition text-sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition text-sm"
              >
                Register Shop
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2">
              <span>{shop?.name}</span>
              {shop?.isApproved ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="h-3 w-3 mr-1" /> Approved
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <ShieldAlert className="h-3 w-3 mr-1" /> Pending Approval
                </span>
              )}
            </h1>
            <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-500" />
              <span>{shop?.address}, {shop?.city}, {shop?.state} {shop?.zipCode}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-semibold rounded-xl border transition ${
                activeTab === 'overview' 
                  ? 'bg-sky-600 border-sky-500 text-white' 
                  : 'bg-slate-800 border-slate-700 text-slate-350 hover:bg-slate-750'
              }`}
            >
              Dashboard
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

        {/* Warning for unapproved shops */}
        {!shop?.isApproved && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-2xl flex items-start space-x-3 text-sm">
            <ShieldAlert className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Notice: Shop Pending Admin Approval.</span> Your shop registry has been submitted but is currently awaiting review by the administrator. Customer bookings will not be available publicly until approval is confirmed.
            </div>
          </div>
        )}

        {/* Tab Selection Render */}
        {activeTab === 'chats' ? (
          <ChatPanel />
        ) : (
          <>
            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
                <div className="p-3 bg-sky-500/10 rounded-xl text-sky-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Active Bookings</div>
                  <div className="text-xl font-bold">{activeBookingsCount} Bookings</div>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
                <div className="p-3 bg-green-500/10 rounded-xl text-green-400">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Completed Repairs</div>
                  <div className="text-xl font-bold">{completedBookingsCount} Completed</div>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
                <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
                  <Wrench className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Services Offered</div>
                  <div className="text-xl font-bold">{services.length} Offered</div>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl flex items-center space-x-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Rating</div>
                  <div className="text-xl font-bold">
                    {shop?.rating > 0 ? `${shop.rating.toFixed(1)} (${shop.totalReviews} reviews)` : 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Split Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Main Bookings Management Panel */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-sky-400" />
                      <span>Customer Bookings</span>
                    </h2>
                    <span className="text-xs text-slate-500">Total requests: {appointments.length}</span>
                  </div>

                  {appointments.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      No repair bookings requested yet.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointments.map((app) => (
                        <div 
                          key={app.id} 
                          className={`border p-5 rounded-2xl bg-slate-900/60 transition ${
                            app.status === 'PENDING' ? 'border-sky-500/30' : 
                            app.status === 'CONFIRMED' ? 'border-indigo-500/30' :
                            app.status === 'IN_PROGRESS' ? 'border-amber-500/30' :
                            app.status === 'COMPLETED' ? 'border-emerald-500/30' : 'border-slate-800'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">{app.serviceName}</span>
                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xxs font-extrabold border ${
                                  app.status === 'PENDING' ? 'bg-sky-500/10 text-sky-400 border-sky-500/20' :
                                  app.status === 'CONFIRMED' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                  app.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                  app.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                  'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                }`}>
                                  {app.status}
                                </span>
                              </div>

                              <div className="text-slate-400 text-xs flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-500" />{app.customerName}</span>
                                {app.customerPhone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-slate-500" />{app.customerPhone}</span>}
                                <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-slate-500" />{app.customerEmail}</span>
                              </div>

                              <div className="text-slate-400 text-xs flex flex-wrap items-center gap-x-4 gap-y-1 pt-1">
                                <span className="flex items-center gap-1 font-semibold text-slate-300">
                                  <Calendar className="h-3.5 w-3.5 text-sky-500" /> Date: {app.appointmentDate}
                                </span>
                                <span className="flex items-center gap-1 font-semibold text-slate-300">
                                  <Clock className="h-3.5 w-3.5 text-sky-500" /> Time: {app.timeSlot}
                                </span>
                              </div>

                              {app.notes && (
                                <div className="mt-2 text-slate-400 text-xs bg-slate-950/40 p-3 rounded-xl flex items-start gap-1.5 border border-slate-800">
                                  <FileText className="h-3.5 w-3.5 text-slate-500 flex-shrink-0 mt-0.5" />
                                  <div><span className="font-semibold text-slate-300">Client Note: </span>{app.notes}</div>
                                </div>
                              )}
                            </div>

                            {/* Booking Status Action Panel */}
                            <div className="flex sm:flex-col items-end justify-end sm:justify-start gap-3 border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
                              
                              <div className="flex gap-2">
                                {app.status === 'PENDING' && (
                                  <>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateStatus(app.id, 'CONFIRMED')}
                                      className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition"
                                      title="Confirm booking"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition"
                                      title="Cancel booking"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                )}

                                {app.status === 'CONFIRMED' && (
                                  <>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateStatus(app.id, 'IN_PROGRESS')}
                                      className="flex items-center space-x-1 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl transition text-xs font-semibold"
                                    >
                                      <Play className="h-3.5 w-3.5" />
                                      <span>Start Repair</span>
                                    </button>
                                    <button
                                      disabled={actionLoading}
                                      onClick={() => handleUpdateStatus(app.id, 'CANCELLED')}
                                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition"
                                      title="Cancel booking"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                )}

                                {app.status === 'IN_PROGRESS' && (
                                  <button
                                    disabled={actionLoading}
                                    onClick={() => handleUpdateStatus(app.id, 'COMPLETED')}
                                    className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition text-xs font-semibold"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    <span>Complete</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar - Manage Shop Services */}
              <div className="space-y-6">
                <div className="bg-slate-950/40 border border-slate-800 rounded-3xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <PenTool className="h-5 w-5 text-sky-400" />
                      <span>Shop Services</span>
                    </h2>
                    <button
                      onClick={() => setShowAddService(!showAddService)}
                      className="p-1.5 bg-sky-500/15 hover:bg-sky-500/25 text-sky-400 rounded-lg transition"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Add Service Inline Form */}
                  {showAddService && (
                    <form onSubmit={handleAddService} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <div>
                        <label className="block text-slate-400 text-xxs font-bold uppercase tracking-wider mb-1">Service Type*</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Screen Replacement, Battery Fix"
                          value={serviceForm.name}
                          onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-1.5 rounded-xl outline-none focus:border-sky-500 transition text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xxs font-bold uppercase tracking-wider mb-1">Custom Name / Note</label>
                        <input
                          type="text"
                          placeholder="e.g. iPhone 13 Screen, Original Grade"
                          value={serviceForm.customName}
                          onChange={(e) => setServiceForm({ ...serviceForm, customName: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-1.5 rounded-xl outline-none focus:border-sky-500 transition text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-xxs font-bold uppercase tracking-wider mb-1">Duration (Min)*</label>
                        <input
                          type="number"
                          required
                          placeholder="Minutes"
                          value={serviceForm.durationMinutes}
                          onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: e.target.value })}
                          className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-1.5 rounded-xl outline-none focus:border-sky-500 transition text-xs"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddService(false)}
                          className="px-3 py-1 text-slate-450 hover:text-white transition text-xs font-semibold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="px-3 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg transition text-xs font-semibold"
                        >
                          Save Service
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Services List */}
                  <div className="space-y-3">
                    {services.map((ser) => (
                      <div key={ser.id} className="p-3 bg-slate-900/60 border border-slate-850 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-sm">{ser.name}</div>
                          {ser.customName && <div className="text-slate-400 text-xxs">{ser.customName}</div>}
                          {ser.durationMinutes > 0 && <div className="text-slate-500 text-xxs mt-0.5">Est. {ser.durationMinutes} mins</div>}
                        </div>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => handleDeleteService(ser.id)}
                            className="p-1 text-slate-500 hover:text-rose-450 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {services.length === 0 && !showAddService && (
                      <div className="text-center py-6 text-slate-500 text-sm">
                        No services added yet. Click the '+' icon above to list services!
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default ShopDashboard;
