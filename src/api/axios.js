import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.10.160:8888',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Set Gateway security mock headers for developer/admin mode
    config.headers['X-Account-Id'] = 'admin-account-id';
    config.headers['X-User-Role'] = 'ADMIN';
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.config?.skipGlobalErrorToast) {
      return Promise.reject(error);
    }

    const status = error.response ? error.response.status : null;

    if (status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('admin_token');
      toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      window.location.href = '/login';
    } else if (status === 403) {
      toast.error('Bạn không có quyền thực hiện thao tác này.');
    } else if (status >= 500) {
      toast.error('Lỗi máy chủ. Vui lòng thử lại sau.');
    } else {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
