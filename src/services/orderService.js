import apiClient from '../api/axios';

const orderService = {
  // GET /api/v1/orders/admin - Xem toàn bộ đơn hàng (Phân trang)
  getAdminOrders: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/v1/orders/admin', { params });
      return response.data;
    } catch (error) {
      console.error('API error fetching admin orders:', error);
      throw error;
    }
  },

  // GET /api/v1/orders/admin/{orderId} - Xem chi tiết đơn hàng cho Admin/Staff
  getAdminOrderById: async (orderId) => {
    try {
      const response = await apiClient.get(`/api/v1/orders/admin/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(`API error fetching order detail for ${orderId}:`, error);
      throw error;
    }
  },

  // PUT /api/v1/orders/{id}/prepare - Duyệt đơn hàng sang trạng thái vận chuyển
  prepareOrder: async (id) => {
    try {
      const response = await apiClient.put(`/api/v1/orders/${id}/prepare`);
      return response.data;
    } catch (error) {
      console.error(`API error approving prepare for order ${id}:`, error);
      throw error;
    }
  }
};

export default orderService;
