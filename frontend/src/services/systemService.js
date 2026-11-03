import api from './api';

export const systemService = {
  getStatus: async () => {
    const res = await api.get('/system/status');
    return res.data.data;
  },

  getLogs: async (limit = 50) => {
    const res = await api.get('/system/logs', { params: { limit } });
    return res.data.data;
  },

  getSettings: async () => {
    const res = await api.get('/system/settings');
    return res.data.data;
  },

  resetDemo: async () => {
    const res = await api.post('/system/reset-demo', { confirm: true });
    return res.data;
  },
};
