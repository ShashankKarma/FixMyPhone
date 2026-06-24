import axios from 'axios';
import { store } from '../store/store';
import { logout, loginSuccess } from '../features/authSlice';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refToken = localStorage.getItem('refreshToken');
      if (refToken) {
        try {
          // Attempt token refresh
          const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken: refToken });
          const { accessToken } = response.data;
          
          localStorage.setItem('token', accessToken);
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          
          // Dispatch action to update store
          store.dispatch(loginSuccess(response.data));
          
          return api(originalRequest);
        } catch (refreshError) {
          // Refresh token expired or invalid -> log out user
          store.dispatch(logout());
          return Promise.reject(refreshError);
        }
      } else {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (name, email, password, phone, role) => {
    const response = await api.post('/auth/register', { name, email, password, phone, role });
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  adminRegisterOwner: async (name, email, password, phone) => {
    const response = await api.post('/auth/admin/register-owner', { name, email, password, phone, role: 'SHOP_OWNER' });
    return response.data;
  }
};

export const shopsAPI = {
  createShop: async (shopData) => {
    const response = await api.post('/shops', shopData);
    return response.data;
  },
  updateShop: async (shopData) => {
    const response = await api.put('/shops', shopData);
    return response.data;
  },
  getMyShop: async () => {
    const response = await api.get('/shops/my');
    return response.data;
  },
  getShopById: async (id) => {
    const response = await api.get(`/shops/${id}`);
    return response.data;
  },
  getShops: async (city) => {
    const params = {};
    if (city) params.city = city;
    const response = await api.get('/shops', { params });
    return response.data;
  },
  getServicesByShop: async (shopId, onlyAvailable = true) => {
    const response = await api.get(`/shops/${shopId}/services`, { params: { onlyAvailable } });
    return response.data;
  },
  addService: async (serviceData) => {
    const response = await api.post('/shops/my/services', serviceData);
    return response.data;
  },
  updateService: async (serviceId, serviceData) => {
    const response = await api.put(`/shops/my/services/${serviceId}`, serviceData);
    return response.data;
  },
  deleteService: async (serviceId) => {
    const response = await api.delete(`/shops/my/services/${serviceId}`);
    return response.data;
  },
  adminGetAllShops: async () => {
    const response = await api.get('/shops/admin/all');
    return response.data;
  },
  adminApproveShop: async (id, approve) => {
    const response = await api.put(`/shops/admin/${id}/approve`, null, { params: { approve } });
    return response.data;
  }
};

export const appointmentsAPI = {
  bookAppointment: async (bookingData) => {
    const response = await api.post('/appointments', bookingData);
    return response.data;
  },
  getAppointmentById: async (id) => {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  },
  getCustomerAppointments: async () => {
    const response = await api.get('/appointments/customer');
    return response.data;
  },
  getShopAppointments: async (shopId) => {
    const response = await api.get(`/appointments/shop/${shopId}`);
    return response.data;
  },
  getShopAppointmentsByDate: async (shopId, date) => {
    const response = await api.get(`/appointments/shop/${shopId}/date`, { params: { date } });
    return response.data;
  },
  updateAppointmentStatus: async (id, status) => {
    const response = await api.put(`/appointments/${id}/status`, null, { params: { status } });
    return response.data;
  },
  getOccupiedSlots: async (shopId, date) => {
    const response = await api.get(`/appointments/shop/${shopId}/occupied-slots`, { params: { date } });
    return response.data;
  },
  adminGetAllAppointments: async () => {
    const response = await api.get('/appointments/admin/all');
    return response.data;
  }
};

export const chatAPI = {
  initiateChat: async (shopId) => {
    const response = await api.post(`/chat/shops/${shopId}/initiate`);
    return response.data;
  },
  getRooms: async () => {
    const response = await api.get('/chat/rooms');
    return response.data;
  },
  getMessages: async (roomId) => {
    const response = await api.get(`/chat/rooms/${roomId}/messages`);
    return response.data;
  },
  sendMessage: async (roomId, content) => {
    const response = await api.post(`/chat/rooms/${roomId}/messages`, { content });
    return response.data;
  }
};

export default api;
