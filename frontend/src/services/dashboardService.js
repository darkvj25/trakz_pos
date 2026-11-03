import api from './api';

export const dashboardService = {
  getSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data.data;
  },

  getRevenue: async (period = 'daily', startDate = null, endDate = null) => {
    const params = { period };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await api.get('/dashboard/revenue', { params });
    return res.data.data;
  },

  getPaymentStatistics: async () => {
    const res = await api.get('/dashboard/payment-statistics');
    return res.data.data;
  },

  getOrderStatistics: async () => {
    const res = await api.get('/dashboard/order-statistics');
    return res.data.data;
  },
};
