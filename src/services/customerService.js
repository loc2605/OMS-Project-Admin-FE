import apiClient from '../api/axios';

const customerService = {
  // 4.1. Lấy danh sách toàn bộ khách hàng
  getCustomers: async () => {
    const response = await apiClient.get('/api/v1/customers');
    return response.data;
  },

  updateAccountStatus: async (accountId, status) => {
    const response = await apiClient.put(`/api/v1/accounts/${accountId}/status`, null, {
      params: { status }
    });
    return response.data;
  }
};

export default customerService;
