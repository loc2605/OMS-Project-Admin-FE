import apiClient from '../api/axios';

const analyticsRequest = { skipGlobalErrorToast: true };

const dashboardService = {
  /** GET /api/v1/analytics/dashboard/summary */
  getSummary: async () => {
    const response = await apiClient.get('/api/v1/analytics/dashboard/summary', analyticsRequest);
    return response.data;
  },

  /** GET /api/v1/analytics/dashboard/inventory-alerts */
  getInventoryAlerts: async () => {
    const response = await apiClient.get('/api/v1/analytics/dashboard/inventory-alerts', analyticsRequest);
    return response.data;
  },

  /** GET /api/v1/analytics/dashboard/revenue-chart?startDate=&endDate= */
  getRevenueChart: async (startDate, endDate) => {
    const response = await apiClient.get('/api/v1/analytics/dashboard/revenue-chart', {
      ...analyticsRequest,
      params: { startDate, endDate },
    });
    return response.data;
  },

  /** GET /api/v1/analytics/dashboard/top-products?limit= */
  getTopProducts: async (limit = 10) => {
    const response = await apiClient.get('/api/v1/analytics/dashboard/top-products', {
      ...analyticsRequest,
      params: { limit },
    });
    return response.data;
  },

  /** GET /api/v1/analytics/dashboard/shippers-kpi */
  getShippersKpi: async () => {
    const response = await apiClient.get('/api/v1/analytics/dashboard/shippers-kpi', analyticsRequest);
    return response.data;
  },

  /** POST /api/v1/ai/chat — RAG chat (unchanged) */
  chat: async (message, userId = 'admin-playground') => {
    const response = await apiClient.post('/api/v1/ai/chat', { message, userId });
    return response.data;
  },

  /** POST /api/v1/ai/sync/bootstrap */
  syncVectorDb: async () => {
    const response = await apiClient.post('/api/v1/ai/sync/bootstrap');
    return response.data;
  },
};

export default dashboardService;
