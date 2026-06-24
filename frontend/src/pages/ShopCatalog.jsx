import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { shopsAPI } from '../services/api';
import { MapPin, Star, Phone, Mail, Search, ArrowRight, Smartphone, ShieldCheck } from 'lucide-react';

const ShopCatalog = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cityFilter, setCityFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch shops
  const fetchShops = async (city = '') => {
    try {
      setLoading(true);
      const data = await shopsAPI.getShops(city);
      setShops(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching shops:', err);
      setError('Failed to load repair shops. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops(cityFilter);
  }, [cityFilter]);

  const handleBookClick = (shopId) => {
    if (isAuthenticated) {
      navigate(`/book/${shopId}`);
    } else {
      // Redirect to login with post-login redirect destination
      navigate(`/login?redirect=/book/${shopId}`);
    }
  };

  // Filter shops by search query locally
  const filteredShops = shops.filter(shop => 
    shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    shop.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center">
              <Smartphone className="h-8 w-8 text-sky-400 mr-2" />
              <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
                FixMyPhone
              </span>
            </Link>
            <div className="flex space-x-4">
              <Link to="/dashboard" className="text-slate-300 hover:text-white px-3 py-2 rounded-md text-sm font-semibold">
                Dashboard
              </Link>
              {!isAuthenticated && (
                <>
                  <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition">
                    Sign In
                  </Link>
                  <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-500/20 transition">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="mb-10 text-center md:text-left md:flex md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Verified <span className="text-sky-400">Repair Shops</span>
            </h1>
            <p className="text-slate-400 mt-2 text-lg">
              Find expert technicians near you and book high-quality repairs with warranty.
            </p>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="bg-slate-950/40 border border-slate-800/80 p-6 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
            <input
              type="text"
              placeholder="Search shops by name, specialty, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 text-white pl-10 pr-4 py-3 rounded-xl outline-none transition"
            />
          </div>

          <div className="w-full md:w-64 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 h-5 w-5" />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-sky-500 text-white pl-10 pr-4 py-3 rounded-xl outline-none appearance-none cursor-pointer transition"
            >
              <option value="">All Cities</option>
              <option value="New York">New York</option>
              <option value="San Francisco">San Francisco</option>
              <option value="Los Angeles">Los Angeles</option>
              <option value="Chicago">Chicago</option>
              <option value="Seattle">Seattle</option>
              <option value="Austin">Austin</option>
            </select>
          </div>
        </div>

        {/* Loading and Error states */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl text-center">
            {error}
          </div>
        ) : filteredShops.length === 0 ? (
          <div className="bg-slate-850 border border-slate-850/80 rounded-2xl p-12 text-center text-slate-500">
            No repair shops found matching your criteria. Try changing your filters.
          </div>
        ) : (
          /* Shop Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredShops.map((shop) => (
              <div 
                key={shop.id} 
                className="bg-slate-950/40 border border-slate-850 hover:border-sky-500/40 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group hover:shadow-2xl hover:shadow-sky-500/5 relative overflow-hidden"
              >
                {/* Visual Glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 rounded-full filter blur-2xl group-hover:bg-sky-500/10 transition-colors"></div>
                
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold group-hover:text-sky-400 transition-colors">
                      {shop.name}
                    </h3>
                    {shop.isApproved && (
                      <span className="flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Verified</span>
                      </span>
                    )}
                  </div>
                  
                  <p className="text-slate-400 text-sm line-clamp-2 mb-6">
                    {shop.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-slate-300 text-sm">
                      <MapPin className="h-4 w-4 text-sky-500 mr-2 flex-shrink-0" />
                      <span className="truncate">{shop.address}, {shop.city}</span>
                    </div>
                    {shop.phone && (
                      <div className="flex items-center text-slate-300 text-sm">
                        <Phone className="h-4 w-4 text-sky-500 mr-2 flex-shrink-0" />
                        <span>{shop.phone}</span>
                      </div>
                    )}
                    {shop.email && (
                      <div className="flex items-center text-slate-300 text-sm">
                        <Mail className="h-4 w-4 text-sky-500 mr-2 flex-shrink-0" />
                        <span className="truncate">{shop.email}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                    <span className="font-bold text-sm">{shop.rating?.toFixed(1) || '4.5'}</span>
                    <span className="text-slate-500 text-xs">({shop.totalReviews || '0'})</span>
                  </div>

                  <button
                    onClick={() => handleBookClick(shop.id)}
                    className="flex items-center space-x-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-sky-600/10 group-hover:translate-x-1"
                  >
                    <span>Book Repair</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopCatalog;
