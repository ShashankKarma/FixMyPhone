import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { loginStart, loginSuccess, loginFailure } from '../features/authSlice';
import { authAPI } from '../services/api';
import { Lock, Mail, User, Phone, Briefcase, Eye, EyeOff, Smartphone } from 'lucide-react';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { loading, error } = useSelector((state) => state.auth);

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      const response = await authAPI.register(
        data.name,
        data.email,
        data.password,
        data.phone,
        'CUSTOMER'
      );
      dispatch(loginSuccess(response));

      // Redirect based on redirectUrl query parameter or role
      const role = response.user.roles[0];
      if (redirectUrl) {
        navigate(redirectUrl);
      } else if (role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else if (role === 'ROLE_SHOP_OWNER') {
        navigate('/shop');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const errMsg = err.response?.data || 'Failed to create account. Please try again.';
      dispatch(loginFailure(errMsg));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Graphic Blobs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-sky-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>

      <div className="max-w-md w-full space-y-8 bg-slate-800/50 backdrop-blur-xl border border-slate-700 p-8 rounded-2xl shadow-2xl relative z-10">
        <div>
          <div className="flex justify-center">
            <div className="bg-sky-500/10 p-3 rounded-2xl border border-sky-500/20">
              <Smartphone className="h-10 w-10 text-sky-400" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create Account
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Join FixMyPhone to book repairs, buy, or sell.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/60 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                placeholder="John Doe"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/60 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                placeholder="name@example.com"
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="tel"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^\+?[0-9]{10,15}$/,
                    message: 'Invalid phone number (10 to 15 digits)'
                  }
                })}
                className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl bg-slate-900/60 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                placeholder="+1234567890"
              />
            </div>
            {errors.phone && (
              <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                })}
                className="block w-full pl-10 pr-10 py-3 border border-slate-700 rounded-xl bg-slate-900/60 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-sky-600 hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Sign Up'
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-400">
            Already have an account?{' '}
            <Link to={redirectUrl ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : "/login"} className="font-medium text-sky-400 hover:text-sky-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
