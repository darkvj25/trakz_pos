import api from './api';

export const syncService = {
  getStatus: async () => {
    const res = await api.get('/sync/status');
    return res.data.data;
  },

  startSync: async (syncType = 'MANUAL') => {
    const res = await api.post('/sync/start', { syncType });
    return res.data.data;
  },

  getHistory: async (limit = 20) => {
    const res = await api.get('/sync/history', { params: { limit } });
    return res.data.data;
  },
};
