import api from './api';

export const authService = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data && res.data.data) {
      localStorage.setItem('trakz_token', res.data.data.token);
      localStorage.setItem('trakz_user', JSON.stringify(res.data.data.user));
    }
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    } finally {
      localStorage.removeItem('trakz_token');
      localStorage.removeItem('trakz_user');
    }
  },

  getCurrentUser: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
