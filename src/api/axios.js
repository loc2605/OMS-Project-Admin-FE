import axios from 'axios';
import { toast } from 'sonner';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.10.159:8888',
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

    // Try to get real logged-in user context
    const userStr = localStorage.getItem('admin_user');
    let accountId = 'admin-account-id';
    let userRole = 'ADMIN';

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.accountId) accountId = user.accountId;
        if (user.role) userRole = user.role;
      } catch (e) {
        console.error('Failed to parse admin_user from localStorage', e);
      }
    }

    // Set Gateway security mock headers for developer/admin mode
    config.headers['X-Account-Id'] = accountId;
    config.headers['X-User-Role'] = userRole;

    console.log(`>>> [API Request] ${config.method?.toUpperCase()} ${config.baseURL || ''}${config.url}`, {
      headers: config.headers,
      params: config.params,
      data: config.data
    });

    return config;
  },
  (error) => {
    console.error('>>> [API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log(`>>> [API Response Success] ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response;
  },
  (error) => {
    console.error(`>>> [API Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url || ''}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config
    });

    const status = error.response ? error.response.status : null;
    const isLoginRequest = error.config?.url?.includes('/api/v1/auth/login');

    if (status === 401 && !isLoginRequest) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.config?.skipGlobalErrorToast) {
      return Promise.reject(error);
    }

    if (status === 403) {
      toast.error('Bạn không có quyền thực hiện thao tác này.');
    } else if (status >= 500) {
      toast.error('Lỗi máy chủ. Vui lòng thử lại sau.');
    } else {
      toast.error(error.response?.data?.message || 'Đã xảy ra lỗi kết nối API');
    }

    return Promise.reject(error);
  }
);

export default apiClient;
