import apiClient from '../api/axios';

const authService = {
  login: async (username, password) => {
    const response = await apiClient.post('/api/v1/auth/login', { username, password });
    if (response.data.success) {
      sessionStorage.setItem('admin_token', response.data.result.token);
      sessionStorage.setItem('admin_user', JSON.stringify(response.data.result));
    }
    return response.data;
  },

  logout: () => {
    sessionStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_user');
  },

  getCurrentUser: () => {
    const user = sessionStorage.getItem('admin_user');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;
