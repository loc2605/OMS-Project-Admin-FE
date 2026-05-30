import apiClient from '../api/axios';

// Mock list of orders for fallback in development when API is offline
let mockOrders = [
  { 
    id: 'OMS-1001', 
    customerName: 'Nguyễn Văn A', 
    customerPhone: '0912345678',
    shippingAddress: '123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh',
    orderDate: '2026-05-24T10:30:00', 
    totalAmount: 1250000, 
    status: 'COMPLETED', 
    paymentMethod: 'COD',
    paymentStatus: 'PAID',
    items: [
      { id: 'item-1', productName: 'Áo thun nam cổ tròn cotton', quantity: 2, price: 150000, imageUrl: 'https://raw.githubusercontent.com/avinashdm/gs-images/main/forever/p_img2_1.png' },
      { id: 'item-2', productName: 'Giày sneaker thể thao nam', quantity: 1, price: 950000, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff' }
    ]
  },
  { 
    id: 'OMS-1002', 
    customerName: 'Trần Thị B', 
    customerPhone: '0987654321',
    shippingAddress: '456 Đường Nguyễn Huệ, Quận Hoàn Kiếm, Hà Nội',
    orderDate: '2026-05-25T14:20:00', 
    totalAmount: 34990000, 
    status: 'PROCESSING', 
    paymentMethod: 'VNPAY',
    paymentStatus: 'PAID',
    items: [
      { id: 'item-3', productName: 'Điện thoại iPhone 15 Pro Max 256GB', quantity: 1, price: 34990000, imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569' }
    ]
  },
  { 
    id: 'OMS-1003', 
    customerName: 'Lê Văn C', 
    customerPhone: '0905123456',
    shippingAddress: '789 Đường Hùng Vương, Hải Châu, Đà Nẵng',
    orderDate: '2026-05-25T09:15:00', 
    totalAmount: 5990000, 
    status: 'PENDING', 
    paymentMethod: 'TRANSFER',
    paymentStatus: 'UNPAID',
    items: [
      { id: 'item-4', productName: 'Màn hình máy tính 27 inch 4K IPS', quantity: 1, price: 5990000, imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf' }
    ]
  },
  { 
    id: 'OMS-1004', 
    customerName: 'Phạm Thị D', 
    customerPhone: '0933987654',
    shippingAddress: '101 Đường Trần Hưng Đạo, Ninh Kiều, Cần Thơ',
    orderDate: '2026-05-26T11:45:00', 
    totalAmount: 19990000, 
    status: 'CANCELLED', 
    paymentMethod: 'COD',
    paymentStatus: 'UNPAID',
    items: [
      { id: 'item-5', productName: 'Laptop Asus Vivobook 15 Ryzen 5', quantity: 1, price: 19990000, imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed' }
    ]
  },
  { 
    id: 'OMS-1005', 
    customerName: 'Hoàng Văn E', 
    customerPhone: '0977112233',
    shippingAddress: '202 Đường Lê Hồng Phong, Vũng Tàu, Bà Rịa - Vũng Tàu',
    orderDate: '2026-05-26T16:00:00', 
    totalAmount: 850000, 
    status: 'COMPLETED', 
    paymentMethod: 'MOMO',
    paymentStatus: 'PAID',
    items: [
      { id: 'item-6', productName: 'Bàn phím cơ không dây TKL', quantity: 1, price: 850000, imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33faf9c1' }
    ]
  },
];

const orderService = {
  // GET /api/v1/orders/admin - Xem toàn bộ đơn hàng (Phân trang)
  getAdminOrders: async (params = {}) => {
    try {
      const response = await apiClient.get('/api/v1/orders/admin', { params });
      return response.data;
    } catch (error) {
      console.warn('API error fetching admin orders, using mock fallback...', error);
      
      // Filter mock orders locally if parameters are passed
      let filtered = [...mockOrders];
      if (params.status) {
        filtered = filtered.filter(o => o.status.toUpperCase() === params.status.toUpperCase());
      }
      if (params.orderId) {
        filtered = filtered.filter(o => o.id.toLowerCase().includes(params.orderId.toLowerCase()));
      }
      if (params.customerName) {
        filtered = filtered.filter(o => o.customerName.toLowerCase().includes(params.customerName.toLowerCase()));
      }

      // Pagination mockup
      const page = Number(params.page) || 0;
      const size = Number(params.size) || 10;
      const start = page * size;
      const paginatedContent = filtered.slice(start, start + size);

      return {
        success: true,
        message: 'Successfully retrieved mock orders (Offline Mode)',
        result: {
          content: paginatedContent,
          pageNumber: page,
          pageSize: size,
          totalElements: filtered.length,
          totalPages: Math.ceil(filtered.length / size)
        }
      };
    }
  },

  // GET /api/v1/orders/admin/{orderId} - Xem chi tiết đơn hàng cho Admin/Staff
  getAdminOrderById: async (orderId) => {
    try {
      const response = await apiClient.get(`/api/v1/orders/admin/${orderId}`);
      return response.data;
    } catch (error) {
      console.warn(`API error fetching order detail for ${orderId}, using mock fallback...`, error);
      const found = mockOrders.find(o => o.id === orderId);
      if (found) {
        return {
          success: true,
          message: 'Successfully retrieved mock order details',
          result: found
        };
      }
      return {
        success: false,
        message: `Không tìm thấy đơn hàng ${orderId}`
      };
    }
  },

  // PUT /api/v1/orders/{id}/prepare - Duyệt đơn hàng sang trạng thái vận chuyển
  prepareOrder: async (id) => {
    try {
      const response = await apiClient.put(`/api/v1/orders/${id}/prepare`);
      return response.data;
    } catch (error) {
      console.warn(`API error approving prepare for order ${id}, using mock fallback...`, error);
      
      // Update our local mock state so it's interactive on screen
      const index = mockOrders.findIndex(o => o.id === id);
      if (index !== -1) {
        // Change status to PROCESSING (or DELIVERING/PREPARED depending on business flow, typical is PROCESSING or PREPARED)
        mockOrders[index].status = 'PROCESSING';
        return {
          success: true,
          message: `Đơn hàng ${id} đã được chuẩn bị và chuyển sang đơn vị vận chuyển thành công! (Simulated)`,
          result: mockOrders[index]
        };
      }
      return {
        success: false,
        message: `Đơn hàng ${id} không tồn tại`
      };
    }
  }
};

export default orderService;
