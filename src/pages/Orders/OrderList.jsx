import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { 
  Download, 
  Filter, 
  Eye, 
  Search, 
  X, 
  Truck, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  User,
  Phone,
  MapPin,
  CreditCard,
  DollarSign
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';
import orderService from '../../services/orderService';
import { toast } from 'sonner';

const Orders = () => {
  // Data States
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);
  
  // Filter & Search States
  const [searchId, setSearchId] = useState('');
  const [searchCustomer, setSearchCustomer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  // Pagination States (Managed by React Table inside Table.jsx, but we also track page in API queries)
  const [page, setPage] = useState(0);
  const [size] = useState(10);

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [preparingOrderId, setPreparingOrderId] = useState(null);

  // Fetch Orders from API
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page,
        size,
        orderId: searchId || undefined,
        customerName: searchCustomer || undefined,
        status: filterStatus || undefined
      };
      
      const response = await orderService.getAdminOrders(params);
      console.log('>>> [API - Orders List] response:', response);
      if (response && response.success) {
        // Handle content in paginated result or default flat list
        const content = response.result?.content || response.result || [];
        setOrders(content);
        setTotalElements(response.result?.totalElements || content.length);
      } else {
        toast.error(response?.message || 'Không thể tải danh sách đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Lỗi kết nối máy chủ khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [page, size, searchId, searchCustomer, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Open Order Detail Modal
  const handleViewDetails = async (orderId) => {
    setDetailsLoading(true);
    try {
      const response = await orderService.getAdminOrderById(orderId);
      console.log('>>> [API - Order Detail] response:', response);
      if (response && response.success) {
        setSelectedOrder(response.result);
      } else {
        toast.error(response?.message || 'Không thể tải chi tiết đơn hàng');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Lỗi khi tải chi tiết đơn hàng');
    } finally {
      setDetailsLoading(false);
    }
  };

  // PUT /api/v1/orders/{id}/prepare - Approve to shipping status
  const handlePrepareOrder = async (orderId) => {
    setPreparingOrderId(orderId);
    try {
      const response = await orderService.prepareOrder(orderId);
      if (response && response.success) {
        toast.success(response.message || `Đơn hàng ${orderId} đã duyệt vận chuyển thành công!`);
        // Refresh details modal with newly updated status
        await handleViewDetails(orderId);
        // Refresh master list
        fetchOrders();
      } else {
        toast.error(response?.message || 'Duyệt đơn hàng thất bại');
      }
    } catch (error) {
      console.error('Error preparing order:', error);
      toast.error('Lỗi hệ thống khi duyệt đơn hàng');
    } finally {
      setPreparingOrderId(null);
    }
  };

  // Helper to map status keys to Vietnamese name & styles
  const getStatusConfig = (status) => {
    const s = String(status).toUpperCase();
    switch (s) {
      case 'COMPLETED':
        return { text: 'Đã hoàn thành', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: CheckCircle };
      case 'PROCESSING':
        return { text: 'Đang vận chuyển', color: '#f26c0d', bg: 'rgba(242, 108, 13, 0.1)', icon: Truck };
      case 'PENDING':
        return { text: 'Chờ duyệt giao', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock };
      case 'CANCELLED':
        return { text: 'Đã hủy', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: AlertCircle };
      default:
        return { text: status, color: '#8a7260', bg: 'rgba(138, 114, 96, 0.1)', icon: Clock };
    }
  };

  // Helper to map payment methods
  const getPaymentMethodLabel = (method) => {
    const m = String(method).toUpperCase();
    if (m === 'COD') return 'Thanh toán COD';
    if (m === 'VNPAY') return 'Ví VNPAY';
    if (m === 'MOMO') return 'Ví MoMo';
    if (m === 'TRANSFER' || m === 'BANK') return 'Chuyển khoản NH';
    return method;
  };

  // Columns for Table.jsx
  const columns = useMemo(() => [
    {
      header: 'Mã Đơn Hàng',
      accessorKey: 'id',
      cell: (info) => (
        <span 
          style={{ fontWeight: '800', color: 'var(--primary)', cursor: 'pointer' }}
          onClick={() => handleViewDetails(info.getValue())}
        >
          {info.getValue()}
        </span>
      )
    },
    {
      header: 'Khách Hàng',
      accessorKey: 'customerName',
      cell: (info) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{info.getValue()}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{info.row.original.customerPhone}</span>
        </div>
      )
    },
    {
      header: 'Ngày Đặt Hàng',
      accessorKey: 'orderDate',
      cell: (info) => formatDate(info.getValue())
    },
    {
      header: 'Tổng Giá Trị',
      accessorKey: 'totalAmount',
      cell: (info) => (
        <span style={{ fontWeight: '800', color: 'var(--text-main)' }}>
          {formatCurrency(info.getValue())}
        </span>
      )
    },
    {
      header: 'Thanh Toán',
      accessorKey: 'paymentMethod',
      cell: (info) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{getPaymentMethodLabel(info.getValue())}</span>
          <span style={{ 
            fontSize: '0.7rem', 
            fontWeight: '700', 
            color: info.row.original.paymentStatus === 'PAID' ? 'var(--success)' : 'var(--error)' 
          }}>
            {info.row.original.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
          </span>
        </div>
      )
    },
    {
      header: 'Trạng Thái',
      accessorKey: 'status',
      cell: (info) => {
        const config = getStatusConfig(info.getValue());
        const Icon = config.icon;
        return (
          <span style={{ 
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.75rem', 
            borderRadius: '9999px', 
            fontSize: '0.75rem', 
            fontWeight: '800',
            background: config.bg,
            color: config.color,
            border: `1px solid ${config.color}20`
          }}>
            <Icon size={12} />
            {config.text}
          </span>
        );
      }
    },
    {
      header: 'Thao Tác',
      id: 'actions',
      cell: (info) => (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            variant="ghost" 
            size="sm" 
            style={{ 
              padding: '0.45rem', 
              color: 'var(--text-muted)',
              borderRadius: '50%',
              background: 'var(--bg-light)',
              border: '1px solid var(--border-color)'
            }}
            onClick={() => handleViewDetails(info.row.original.id)}
          >
            <Eye size={16} color="var(--primary)" />
          </Button>

          {info.row.original.status?.toUpperCase() === 'PENDING' && (
            <Button
              variant="primary"
              size="sm"
              style={{
                padding: '0.45rem',
                borderRadius: '50%',
                boxShadow: '0 4px 10px rgba(242, 108, 13, 0.2)'
              }}
              onClick={() => handlePrepareOrder(info.row.original.id)}
              isLoading={preparingOrderId === info.row.original.id}
            >
              <Truck size={16} />
            </Button>
          )}
        </div>
      )
    }
  ], [preparingOrderId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '3rem' }}>
      
      {/* Header and Quick Stats */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', margin: 0 }}>Quản lý Đơn hàng</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>Theo dõi, tra cứu và duyệt trạng thái vận chuyển cho đơn hàng</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button 
            variant="secondary" 
            icon={Download} 
            size="sm"
            onClick={() => {
              toast.success('Báo cáo đơn hàng đã được xuất thành công!');
            }}
          >
            Xuất Excel
          </Button>
        </div>
      </div>

      {/* Advanced Filter Box */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-subtle)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'flex-end'
      }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <Input 
            label="Tìm theo Mã Đơn" 
            placeholder="Nhập mã đơn (Ví dụ: OMS-1001)..." 
            icon={Search}
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
          />
        </div>
        
        <div style={{ flex: 1, minWidth: '200px' }}>
          <Input 
            label="Tìm tên Khách Hàng" 
            placeholder="Nhập tên khách hàng..." 
            icon={User}
            value={searchCustomer}
            onChange={(e) => setSearchCustomer(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '200px' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>
            Trạng thái Đơn hàng
          </label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Filter size={16} style={{ position: 'absolute', left: '14px', color: 'var(--text-muted)' }} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.85rem 1rem 0.85rem 2.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-main)',
                outline: 'none',
                fontWeight: '600',
                appearance: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ duyệt giao (Pending)</option>
              <option value="PROCESSING">Đang vận chuyển (Processing)</option>
              <option value="COMPLETED">Đã hoàn thành (Completed)</option>
              <option value="CANCELLED">Đã hủy (Cancelled)</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button 
            variant="primary" 
            size="md"
            onClick={fetchOrders}
            style={{ padding: '0.85rem 1.5rem', borderRadius: 'var(--radius-lg)' }}
          >
            Lọc Đơn
          </Button>
          {(searchId || searchCustomer || filterStatus) && (
            <Button 
              variant="secondary" 
              size="md"
              style={{ padding: '0.85rem 1rem', borderRadius: 'var(--radius-lg)' }}
              onClick={() => {
                setSearchId('');
                setSearchCustomer('');
                setFilterStatus('');
              }}
            >
              Đặt lại
            </Button>
          )}
        </div>
      </div>

      {/* Main Table Wrapper */}
      <div className="animate-fade-in">
        <Table columns={columns} data={orders} isLoading={loading} />
      </div>

      {/* DETAILED GLASSMORPHISM ORDER MODAL */}
      {selectedOrder && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999,
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {/* Modal Content */}
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '850px',
            maxHeight: '90vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            animation: 'fadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedOrder(null)}
              style={{
                position: 'absolute',
                top: '1.25rem',
                right: '1.25rem',
                background: 'rgba(0,0,0,0.05)',
                border: 'none',
                color: 'var(--text-muted)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
            >
              <X size={18} />
            </button>

            {/* Modal Header */}
            <div style={{ 
              padding: '1.75rem', 
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              backgroundImage: 'radial-gradient(circle at 10% 20%, rgba(242, 108, 13, 0.04) 0%, transparent 60%)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <FileText size={24} color="var(--primary)" />
                  <h3 style={{ fontSize: '1.35rem', fontWeight: '800', margin: 0 }}>Chi tiết Đơn hàng {selectedOrder.id}</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: '600', marginTop: '0.2rem' }}>
                  Khởi tạo lúc: {formatDate(selectedOrder.orderDate)}
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {(() => {
                  const config = getStatusConfig(selectedOrder.status);
                  const Icon = config.icon;
                  return (
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.5rem 1rem', 
                      borderRadius: '9999px', 
                      fontSize: '0.8rem', 
                      fontWeight: '800',
                      background: config.bg,
                      color: config.color,
                      border: `1px solid ${config.color}30`
                    }}>
                      <Icon size={14} />
                      {config.text.toUpperCase()}
                    </span>
                  );
                })()}
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              
              {/* Information Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
                
                {/* customer Information */}
                <div style={{ 
                  background: 'var(--bg-light)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '1.25rem' 
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <User size={16} /> Thông Tin Khách Hàng
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Tên người nhận:</span>
                      <p style={{ fontWeight: '700', color: 'var(--text-main)', marginTop: '0.1rem' }}>{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Số điện thoại:</span>
                      <p style={{ fontWeight: '700', color: 'var(--text-main)', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Phone size={13} color="var(--text-muted)" /> {selectedOrder.customerPhone}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Địa chỉ nhận hàng:</span>
                      <p style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '0.1rem', display: 'flex', alignItems: 'flex-start', gap: '0.25rem', lineHeight: '1.4' }}>
                        <MapPin size={13} color="var(--text-muted)" style={{ marginTop: '3px', flexShrink: 0 }} /> {selectedOrder.shippingAddress}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div style={{ 
                  background: 'var(--bg-light)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '1.25rem' 
                }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <CreditCard size={16} /> Phương Thức Thanh Toán
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Cổng thanh toán:</span>
                      <p style={{ fontWeight: '700', color: 'var(--text-main)', marginTop: '0.1rem' }}>{getPaymentMethodLabel(selectedOrder.paymentMethod)}</p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Trạng thái thanh toán:</span>
                      <p style={{ 
                        fontWeight: '800', 
                        color: selectedOrder.paymentStatus === 'PAID' ? 'var(--success)' : 'var(--error)', 
                        marginTop: '0.1rem',
                        display: 'inline-flex',
                        padding: '0.15rem 0.5rem',
                        background: selectedOrder.paymentStatus === 'PAID' ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                        borderRadius: '4px'
                      }}>
                        {selectedOrder.paymentStatus === 'PAID' ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Tổng thanh toán:</span>
                      <p style={{ fontWeight: '900', color: 'var(--primary)', fontSize: '1.2rem', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
                        <DollarSign size={18} /> {formatCurrency(selectedOrder.totalAmount)}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Order Items Table */}
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                  Danh Sách Sản Phẩm Đặt Mua ({selectedOrder.items?.length || 0})
                </h4>
                <div style={{ 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius-lg)', 
                  overflow: 'hidden'
                }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                        <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: '700' }}>Sản phẩm</th>
                        <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: '700', textAlign: 'right' }}>Giá bán</th>
                        <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: '700', textAlign: 'center' }}>Số lượng</th>
                        <th style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)', fontWeight: '700', textAlign: 'right' }}>Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            {item.imageUrl ? (
                              <img 
                                src={item.imageUrl} 
                                alt={item.productName} 
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                              />
                            ) : (
                              <div style={{ width: '40px', height: '40px', background: 'var(--border-color)', borderRadius: '6px' }} />
                            )}
                            <div>
                              <p style={{ fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{item.productName}</p>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>Mã SP: {item.id}</span>
                            </div>
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600' }}>
                            {formatCurrency(item.price)}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '700', color: 'var(--primary)' }}>
                            {item.quantity}
                          </td>
                          <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: 'var(--text-main)' }}>
                            {formatCurrency(item.price * item.quantity)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Status workflow timeline illustration */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
                  Tiến Trình Đơn Hàng
                </h4>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  background: 'var(--bg-light)', 
                  padding: '1.25rem 2rem', 
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  overflowX: 'auto',
                  gap: '1rem'
                }}>
                  {/* Step 1: PENDING */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: 'var(--warning)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '800', fontSize: '0.85rem',
                      boxShadow: '0 0 10px rgba(245, 158, 11, 0.3)'
                    }}>✓</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '0.5rem', color: 'var(--text-main)' }}>Khách đặt hàng</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Đã tạo đơn</span>
                  </div>

                  <div style={{ flex: 1, height: '3px', background: selectedOrder.status !== 'PENDING' ? 'var(--primary)' : 'var(--border-color)', minWidth: '40px' }} />

                  {/* Step 2: PROCESSING / PREPARED */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: (selectedOrder.status === 'PROCESSING' || selectedOrder.status === 'COMPLETED') ? 'var(--primary)' : 'var(--border-color)',
                      color: (selectedOrder.status === 'PROCESSING' || selectedOrder.status === 'COMPLETED') ? 'white' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '800', fontSize: '0.85rem'
                    }}>{(selectedOrder.status === 'PROCESSING' || selectedOrder.status === 'COMPLETED') ? '✓' : '2'}</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '0.5rem', color: (selectedOrder.status === 'PROCESSING' || selectedOrder.status === 'COMPLETED') ? 'var(--text-main)' : 'var(--text-muted)' }}>Chuẩn bị & Giao vận</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {selectedOrder.status === 'PENDING' ? 'Chờ chuẩn bị' : 'Đang giao hàng'}
                    </span>
                  </div>

                  <div style={{ flex: 1, height: '3px', background: selectedOrder.status === 'COMPLETED' ? 'var(--success)' : 'var(--border-color)', minWidth: '40px' }} />

                  {/* Step 3: COMPLETED */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1 }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '50%',
                      background: selectedOrder.status === 'COMPLETED' ? 'var(--success)' : 'var(--border-color)',
                      color: selectedOrder.status === 'COMPLETED' ? 'white' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '800', fontSize: '0.85rem',
                      boxShadow: selectedOrder.status === 'COMPLETED' ? '0 0 10px rgba(34, 197, 94, 0.3)' : 'none'
                    }}>{selectedOrder.status === 'COMPLETED' ? '✓' : '3'}</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '0.5rem', color: selectedOrder.status === 'COMPLETED' ? 'var(--text-main)' : 'var(--text-muted)' }}>Đã hoàn thành</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Giao hàng thành công</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal Footer / Action Bar */}
            <div style={{ 
              padding: '1.25rem 1.75rem', 
              borderTop: '1px solid var(--border-color)',
              background: 'rgba(0,0,0,0.01)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '0.75rem',
              alignItems: 'center'
            }}>
              <Button 
                variant="secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Đóng lại
              </Button>
              
              {/* Duyệt vận chuyển Button (Approve to shipping) */}
              {selectedOrder.status?.toUpperCase() === 'PENDING' && (
                <Button
                  variant="primary"
                  icon={Truck}
                  onClick={() => handlePrepareOrder(selectedOrder.id)}
                  isLoading={preparingOrderId === selectedOrder.id}
                  style={{
                    padding: '0.75rem 1.75rem',
                    fontSize: '0.95rem',
                    fontWeight: '800',
                    background: 'linear-gradient(135deg, #f26c0d 0%, #ea580c 100%)',
                    boxShadow: '0 4px 15px rgba(242, 108, 13, 0.4)'
                  }}
                >
                  Duyệt đơn & Giao vận
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Simple global animations injected */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

    </div>
  );
};

export default Orders;
