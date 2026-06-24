import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BookAppointment from './pages/customer/BookAppointment';
import ShopDashboard from './pages/shop/ShopDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ShopCatalog from './pages/ShopCatalog';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/shops" element={<ShopCatalog />} />

      {/* Protected Customer Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/book/:shopId"
        element={
          <ProtectedRoute allowedRoles={['ROLE_CUSTOMER']}>
            <BookAppointment />
          </ProtectedRoute>
        }
      />

      {/* Protected Shop Owner Routes */}
      <Route
        path="/shop"
        element={
          <ProtectedRoute allowedRoles={['ROLE_SHOP_OWNER']}>
            <ShopDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ROLE_ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
