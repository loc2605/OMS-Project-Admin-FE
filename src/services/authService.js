import apiClient from '../api/axios';

const authService = {
  login: async (username, password) => {
    const response = await apiClient.post('/api/v1/auth/login', { username, password });
    if (response.data.success) {
      localStorage.setItem('admin_token', response.data.result.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.result));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
