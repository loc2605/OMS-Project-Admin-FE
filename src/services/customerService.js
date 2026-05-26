import apiClient from '../api/axios';

const customerService = {
  // 4.1. Lấy danh sách toàn bộ khách hàng
  getCustomers: async () => {
    const response = await apiClient.get('/api/v1/customers');
    return response.data;
  }
};

export default customerService;
