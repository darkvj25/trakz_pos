import api from './api';

export const paymentService = {
  getPayments: async (params = {}) => {
    const res = await api.get('/payments', { params });
    return res.data.data;
  },

  getPaymentById: async (id) => {
    const res = await api.get(`/payments/${id}`);
    return res.data.data;
  },

  getStatistics: async () => {
    const res = await api.get('/payments/statistics');
    return res.data.data;
  },

  exportPayments: async (params = {}) => {
    const res = await api.get('/payments/export', { params });
    return res.data.data;
  },
};
