import api from './api';

export const orderService = {
  getOrders: async (params = {}) => {
    const res = await api.get('/orders', { params });
    return res.data.data;
  },

  getOrderById: async (id) => {
    const res = await api.get(`/orders/${id}`);
    return res.data.data;
  },

  getOrderItems: async (id) => {
    const res = await api.get(`/orders/${id}/items`);
    return res.data.data;
  },

  exportOrders: async (params = {}) => {
    const res = await api.get('/orders/export', { params });
    return res.data.data;
  },

  createOrder: async (orderData) => {
    const res = await api.post('/orders', orderData);
    return res.data.data;
  },
};
