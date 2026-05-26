import apiClient from '../api/axios';

const dashboardService = {
  // 5.2. Số liệu Tóm tắt hoạt động trong ngày (Dashboard Summary)
  getSummary: async () => {
    const response = await apiClient.get('/api/v1/analytics/dashboard/summary');
    return response.data;
  },

  // 5.1. Danh sách cảnh báo tồn kho thấp (Enriched Low-Stock Alerts)
  getInventoryAlerts: async () => {
    const response = await apiClient.get('/api/v1/analytics/dashboard/inventory-alerts');
    return response.data;
  },

  // 5.3. Số liệu Biểu đồ Doanh thu (Revenue Chart)
  getRevenueChart: async (startDate, endDate) => {
    const response = await apiClient.get('/api/v1/analytics/dashboard/revenue-chart', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // 5.4. Danh sách Sản phẩm bán chạy (Top Selling Products)
  getTopProducts: async (limit = 10) => {
    const response = await apiClient.get('/api/v1/analytics/dashboard/top-products', {
      params: { limit }
    });
    return response.data;
  },

  // 5.5. Chỉ số hiệu suất Shipper (Shippers KPI)
  getShippersKpi: async () => {
    const response = await apiClient.get('/api/v1/analytics/dashboard/shippers-kpi');
    return response.data;
  },

  // 1.1. Hỏi đáp & Tư vấn Mua sắm (RAG Chat)
  chat: async (message, userId = "admin-playground") => {
    const response = await apiClient.post('/api/v1/ai/chat', { message, userId });
    return response.data;
  },

  // 1.2. Đồng bộ hóa Vector DB thủ công
  syncVectorDb: async () => {
    const response = await apiClient.post('/api/v1/ai/sync/bootstrap');
    return response.data;
  }
};

export default dashboardService;
