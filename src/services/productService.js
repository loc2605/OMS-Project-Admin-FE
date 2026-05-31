import apiClient from '../api/axios';

const productService = {
  // Public APIs
  getProducts: async (params) => {
    // params: { page, size, category, name }
    const response = await apiClient.get('/api/v1/products', { params });
    return response.data;
  },

  getCategories: async () => {
    const response = await apiClient.get('/api/v1/categories');
    return response.data;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`/api/v1/products/${id}`);
    return response.data;
  },

  // Admin APIs
  createProduct: async (productData) => {
    const isFormData = productData instanceof FormData;
    const response = await apiClient.post('/api/v1/products', productData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  },

  updateProduct: async (id, productData) => {
    const isFormData = productData instanceof FormData;
    const response = await apiClient.put(`/api/v1/products/${id}`, productData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    });
    return response.data;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`/api/v1/products/${id}`);
    return response.data;
  },

  // Inventory Integration
  getInventory: async (productId) => {
    const response = await apiClient.get(`/api/v1/inventory/product/${productId}`);
    return response.data;
  },

  updateInventory: async (productId, quantity, type) => {
    const response = await apiClient.post('/api/v1/inventory/update', {
      productId,
      quantity: Number(quantity),
      type // "ADD" | "REDUCE"
    });
    return response.data;
  }
};

export default productService;
