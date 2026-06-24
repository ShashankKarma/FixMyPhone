import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Smartphone, Wrench, Shield, DollarSign } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user && user.roles && user.roles.length > 0) {
      const role = user.roles[0];
      if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (role === 'ROLE_SHOP_OWNER') {
        navigate('/shop');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navbar */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Smartphone className="h-8 w-8 text-sky-400 mr-2" />
              <span className="font-extrabold text-xl tracking-wider bg-gradient-to-r from-sky-400 to-indigo-500 bg-clip-text text-transparent">
                FixMyPhone
              </span>
            </div>
            <div className="flex space-x-4">
              <Link to="/login" className="px-4 py-2 text-sm font-semibold text-slate-300 hover:text-white transition">
                Sign In
              </Link>
              <Link to="/register" className="px-4 py-2 text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-500/20 transition">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-sky-500/10 rounded-full filter blur-3xl"></div>
        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-6">
          Your One-Stop Mobile <br />
          <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
            Repair & Marketplace
          </span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Book trusted mobile repair appointments, sell your old device instantly, or purchase certified refurbished smartphones with warranty.
        </p>
        <div className="flex justify-center space-x-4">
          <Link to="/book/1" className="px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow-xl shadow-sky-500/10 transition">
            Book a Repair
          </Link>
          <Link to="/login" className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700 transition">
            Sell Your Phone
          </Link>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl">
            <Wrench className="h-10 w-10 text-sky-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Expert Repairs</h3>
            <p className="text-slate-400 text-sm">
              Schedule quick service appointments at local verified shops for screen, battery, camera, and logic board fixes.
            </p>
          </div>
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl">
            <DollarSign className="h-10 w-10 text-green-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Sell Devices</h3>
            <p className="text-slate-400 text-sm">
              List your old mobile phone, get approved by administrators, and receive instant offers with complete security.
            </p>
          </div>
          <div className="bg-slate-800/40 border border-slate-800 p-6 rounded-2xl">
            <Shield className="h-10 w-10 text-indigo-400 mb-4" />
            <h3 className="text-lg font-bold mb-2">Refurbished Catalog</h3>
            <p className="text-slate-400 text-sm">
              Buy certified refurbished smartphones with up to 12 months warranty, multi-point checks, and verified conditions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
