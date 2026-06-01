import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
import * as XLSX from 'xlsx';

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
  const [size] = useState(100);

  // Selected Order for Details Modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [preparingOrderId, setPreparingOrderId] = useState(null);

  // Fetch Orders from API
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: 0,
        size,
        orderId: searchId || undefined,
        customerName: searchCustomer || undefined,
        status: filterStatus || undefined
      };

      const response = await orderService.getAdminOrders(params);
      console.log('%c>>> [API - Orders List] response:', 'color: #f26c0d; font-weight: bold; font-size: 13px; background: rgba(242, 108, 13, 0.15); padding: 4px 8px; border-radius: 4px;', response);
      if (response && response.success) {
        // Handle content in paginated result or default flat list
        let content = response.result?.content || response.result || [];

        // Client-side backup filtering in case backend ignores query parameters
        if (searchId) {
          content = content.filter(o => {
            const oid = String(o.orderId || o.id || '').toLowerCase();
            return oid.includes(searchId.trim().toLowerCase());
          });
        }
        if (searchCustomer) {
          content = content.filter(o => {
            const receiverName = String(o.shippingAddress?.receiverName || o.customerName || '').toLowerCase();
            const receiverPhone = String(o.shippingAddress?.receiverPhone || o.customerPhone || '').toLowerCase();
            return receiverName.includes(searchCustomer.trim().toLowerCase()) || receiverPhone.includes(searchCustomer.trim().toLowerCase());
          });
        }
        if (filterStatus) {
          content = content.filter(o => {
            const stat = String(o.status || '').toUpperCase();
            const filter = filterStatus.toUpperCase();
            if (filter === 'PROCESSING') {
              return ['PROCESSING', 'SHIPPING', 'DELIVERING'].includes(stat);
            }
            if (filter === 'COMPLETED') {
              return ['COMPLETED', 'COMPLETE', 'SUCCESS'].includes(stat);
            }
            if (filter === 'PENDING') {
              return ['PENDING', 'UNCONFIRMED'].includes(stat);
            }
            if (filter === 'CANCELLED') {
              return ['CANCELLED', 'CANCEL', 'CANCELED'].includes(stat);
            }
            return stat === filter;
          });
        }

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
  }, [size, searchId, searchCustomer, filterStatus]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Export all matching list to Excel
  const handleExportExcel = async () => {
    toast.loading('Đang khởi tạo dữ liệu báo cáo...', { id: 'export-excel' });
    try {
      // Query parameters matching the current active filter states, but with a massive size to fetch all records
      const params = {
        page: 0,
        size: 1000, // Large size to fetch all matching entries
        orderId: searchId || undefined,
        customerName: searchCustomer || undefined,
        status: filterStatus || undefined
      };

      const response = await orderService.getAdminOrders(params);
      if (!response || !response.success) {
        toast.error('Không thể tải danh sách đơn hàng để xuất!', { id: 'export-excel' });
        return;
      }

      let allOrders = response.result?.content || response.result || [];

      // Client-side backup filtering in case backend ignores query parameters
      if (searchId) {
        allOrders = allOrders.filter(o => {
          const oid = String(o.orderId || o.id || '').toLowerCase();
          return oid.includes(searchId.trim().toLowerCase());
        });
      }
      if (searchCustomer) {
        allOrders = allOrders.filter(o => {
          const receiverName = String(o.shippingAddress?.receiverName || o.customerName || '').toLowerCase();
          const receiverPhone = String(o.shippingAddress?.receiverPhone || o.customerPhone || '').toLowerCase();
          return receiverName.includes(searchCustomer.trim().toLowerCase()) || receiverPhone.includes(searchCustomer.trim().toLowerCase());
        });
      }
      if (filterStatus) {
        allOrders = allOrders.filter(o => {
          const stat = String(o.status || '').toUpperCase();
          const filter = filterStatus.toUpperCase();
          if (filter === 'PROCESSING') {
            return ['PROCESSING', 'SHIPPING', 'DELIVERING'].includes(stat);
          }
          if (filter === 'COMPLETED') {
            return ['COMPLETED', 'COMPLETE', 'SUCCESS'].includes(stat);
          }
          if (filter === 'PENDING') {
            return ['PENDING', 'UNCONFIRMED'].includes(stat);
          }
          if (filter === 'CANCELLED') {
            return ['CANCELLED', 'CANCEL', 'CANCELED'].includes(stat);
          }
          return stat === filter;
        });
      }

      if (allOrders.length === 0) {
        toast.error('Không có dữ liệu đơn hàng phù hợp để xuất!', { id: 'export-excel' });
        return;
      }

      // Format data for Excel
      const excelData = allOrders.map((order, index) => {
        // Determine payment status in Vietnamese
        const paymentStatusText = order.paymentId === 'COD_CONFIRMATION' ? 'CHƯA THANH TOÁN' : 'ĐÃ THANH TOÁN';

        // Format payment method in Vietnamese
        const paymentMethodText = order.paymentMethod === 'COD' ? 'Thanh toán COD' : 'VNPAY';

        // Format status in Vietnamese
        let statusText = 'Chờ duyệt giao';
        const stat = String(order.status || '').toUpperCase();
        if (['PROCESSING', 'SHIPPING', 'DELIVERING'].includes(stat)) {
          statusText = 'Đang vận chuyển';
        } else if (['COMPLETED', 'COMPLETE', 'SUCCESS'].includes(stat)) {
          statusText = 'Đã hoàn thành';
        } else if (['CANCELLED', 'CANCEL', 'CANCELED'].includes(stat)) {
          statusText = 'Đã hủy';
        } else if (stat === 'CONFIRMED') {
          statusText = 'Đã xác nhận';
        }

        // Format order items into a readable string
        const rawItems = order.orderItems || order.items || [];
        const itemsText = rawItems.map(item => {
          const name = item.productName || item.name || 'Sản phẩm';
          const qty = item.quantity || item.amount || 1;
          return `${name} (x${qty})`;
        }).join(', ');

        // Extract address information
        const receiverName = order.shippingAddress?.receiverName || order.customerName || '';
        const receiverPhone = order.shippingAddress?.receiverPhone || order.customerPhone || '';
        const street = order.shippingAddress?.street || '';
        const ward = order.shippingAddress?.ward || '';
        const city = order.shippingAddress?.city || '';
        const fullAddress = `${street}${ward ? `, ${ward}` : ''}${city ? `, ${city}` : ''}`;

        return {
          'STT': index + 1,
          'Mã Đơn Hàng': order.orderId || order.id || '',
          'Khách Hàng': receiverName,
          'Số Điện Thoại': receiverPhone,
          'Địa Chỉ Giao Hàng': fullAddress,
          'Sản Phẩm': itemsText,
          'Tổng Tiền': order.totalAmount || 0,
          'Phương Thức': paymentMethodText,
          'Thanh Toán': paymentStatusText,
          'Trạng Thái Đơn Hàng': statusText,
          'Ngày Đặt Hàng': formatDate(order.createdAt),
          'Thông Báo Lỗi': order.errorMessage || ''
        };
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(excelData);

      // Set column widths so the sheet looks extremely beautiful and readable
      const columnWidths = [
        { wch: 6 },   // STT
        { wch: 40 },  // Mã Đơn Hàng
        { wch: 25 },  // Khách Hàng
        { wch: 15 },  // Số Điện Thoại
        { wch: 45 },  // Địa Chỉ Giao Hàng
        { wch: 40 },  // Sản Phẩm
        { wch: 15 },  // Tổng Tiền
        { wch: 20 },  // Phương Thức
        { wch: 20 },  // Thanh Toán
        { wch: 20 },  // Trạng Thái Đơn Hàng
        { wch: 20 },  // Ngày Đặt Hàng
        { wch: 30 }   // Thông Báo Lỗi
      ];
      worksheet['!cols'] = columnWidths;

      // Create workbook and append worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Danh sách Đơn hàng');

      // Generate file name with current date
      const dateStr = new Date().toLocaleDateString('vi-VN').replace(/\//g, '-');
      const fileName = `Danh_Sach_Don_Hang_${dateStr}.xlsx`;

      // Write and download workbook
      XLSX.writeFile(workbook, fileName);
      toast.success('Báo cáo đơn hàng đã được xuất thành công!', { id: 'export-excel' });
    } catch (err) {
      console.error('Error exporting excel:', err);
      toast.error('Lỗi khi xuất file Excel!', { id: 'export-excel' });
    }
  };

  // Open Order Detail Modal
  const handleViewDetails = async (orderId) => {
    setDetailsLoading(true);
    try {
      const response = await orderService.getAdminOrderById(orderId);
      console.log('%c>>> [API - Order Detail] response:', 'color: #3b82f6; font-weight: bold; font-size: 13px; background: rgba(59, 130, 246, 0.15); padding: 4px 8px; border-radius: 4px;', response);
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
        // Refresh details modal with newly updated status if it's currently open
        if (selectedOrder && selectedOrder.orderId === orderId) {
          await handleViewDetails(orderId);
        }
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
      case 'COMPLETE':
      case 'SUCCESS':
        return { text: 'Đã hoàn thành', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', icon: CheckCircle };
      case 'PROCESSING':
      case 'SHIPPING':
      case 'DELIVERING':
        return { text: 'Đang vận chuyển', color: '#f26c0d', bg: 'rgba(242, 108, 13, 0.1)', icon: Truck };
      case 'PENDING':
        return { text: 'Chờ duyệt giao', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: Clock };
      case 'PAYMENT_PENDING':
        return { text: 'Chờ thanh toán', color: '#a855f7', bg: 'rgba(168, 85, 247, 0.1)', icon: Clock };
      case 'CONFIRMED':
        return { text: 'Đã xác nhận', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: CheckCircle };
      case 'CANCELLED':
      case 'CANCEL':
      case 'CANCELED':
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
      accessorKey: 'orderId',
      cell: (info) => {
        const val = info.getValue() || info.row.original.id || '';
        return (
          <span
            style={{
              fontWeight: '800',
              color: 'var(--primary)',
              cursor: 'pointer',
              fontSize: '0.7rem',
              fontFamily: 'monospace',
              letterSpacing: '-0.035em',
              wordBreak: 'break-all'
            }}
            onClick={() => handleViewDetails(val)}
          >
            {val}
          </span>
        );
      }
    },
    {
      header: 'Khách Hàng',
      accessorKey: 'shippingAddress.receiverName',
      cell: (info) => {
        const addr = info.row.original.shippingAddress || {};
        const receiverName = addr.receiverName || info.row.original.customerName || 'N/A';
        const receiverPhone = addr.receiverPhone || info.row.original.customerPhone || 'N/A';
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{receiverName}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{receiverPhone}</span>
          </div>
        );
      }
    },
    {
      header: 'Ngày Đặt Hàng',
      accessorKey: 'createdAt',
      cell: (info) => {
        const dateVal = info.getValue() || info.row.original.orderDate;
        return formatDate(dateVal);
      }
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
      cell: (info) => {
        const paymentStatus = String(info.row.original.paymentStatus || '').toUpperCase();
        const paymentMethod = String(info.row.original.paymentMethod || '').toUpperCase();
        const orderStatus = String(info.row.original.status || '').toUpperCase();
        
        const isPaid = paymentStatus === 'PAID' ||
          paymentStatus === 'SUCCESS' ||
          info.row.original.paymentId?.includes('SUCCESS') ||
          info.row.original.status === 'COMPLETED' ||
          (paymentMethod !== 'COD' && !['PENDING', 'PAYMENT_PENDING'].includes(orderStatus));
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '600' }}>{getPaymentMethodLabel(info.getValue())}</span>
            <span style={{
              fontSize: '0.7rem',
              fontWeight: '700',
              color: isPaid ? 'var(--success)' : 'var(--error)'
            }}>
              {isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
            </span>
          </div>
        );
      }
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
      cell: (info) => {
        const currentOrderId = info.row.original.orderId || info.row.original.id;
        const orderStatus = info.row.original.status?.toUpperCase();
        const canPrepare = orderStatus === 'PENDING' || orderStatus === 'CONFIRMED';

        return (
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
              onClick={() => handleViewDetails(currentOrderId)}
              title="Xem chi tiết"
            >
              <Eye size={16} color="var(--primary)" />
            </Button>

            {canPrepare && (
              <Button
                variant="primary"
                size="sm"
                style={{
                  padding: '0.45rem',
                  borderRadius: '50%',
                  boxShadow: '0 4px 10px rgba(242, 108, 13, 0.2)'
                }}
                onClick={() => handlePrepareOrder(currentOrderId)}
                isLoading={preparingOrderId === currentOrderId}
                title="Duyệt giao hàng"
              >
                <Truck size={16} />
              </Button>
            )}
          </div>
        );
      }
    }
  ], [preparingOrderId]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

      {/* Sticky Header + Filter Zone */}
      <div style={{
        position: 'sticky',
        top: '-1.5rem',
        zIndex: 20,
        background: 'var(--bg-main)',
        paddingTop: '1.5rem',
        paddingBottom: '1rem',
        marginTop: '-1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        borderBottom: '1px solid var(--border-color)'
      }}>
        {/* Header and Quick Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.85rem', fontWeight: '800', margin: 0 }}>Quản lý đơn hàng</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>Theo dõi, tra cứu và duyệt trạng thái vận chuyển cho đơn hàng</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button
              variant="secondary"
              icon={Download}
              size="sm"
              onClick={handleExportExcel}
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
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'flex-end'
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Input
              label="Tìm theo Mã Đơn"
              placeholder="Nhập mã đơn..."
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
                <option value="PENDING">Chờ duyệt giao</option>
                <option value="CONFIRMED">Đã xác nhận</option>
                <option value="PROCESSING">Đang vận chuyển</option>
                <option value="COMPLETED">Đã hoàn thành</option>
                <option value="CANCELLED">Đã hủy</option>
              </select>
            </div>
          </div>

          {(searchId || searchCustomer || filterStatus) && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                variant="secondary"
                size="md"
                style={{
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontWeight: '700'
                }}
                onClick={() => {
                  setSearchId('');
                  setSearchCustomer('');
                  setFilterStatus('');
                }}
              >
                Đặt lại
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Table Wrapper */}
      <div className="animate-fade-in">
        <Table columns={columns} data={orders} isLoading={loading} itemLabel="đơn hàng" />
      </div>

      {/* DETAILED GLASSMORPHISM ORDER MODAL */}
      {selectedOrder && createPortal(
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
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-xl)',
            width: '100%',
            maxWidth: '1200px',
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
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', margin: 0, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
                    <span>Chi tiết Đơn hàng</span>
                    <code style={{
                      fontSize: '0.85rem',
                      padding: '0.2rem 0.5rem',
                      background: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '6px',
                      color: 'var(--primary)',
                      fontWeight: '600',
                      fontFamily: 'monospace'
                    }}>
                      #{selectedOrder.orderId || selectedOrder.id}
                    </code>
                  </h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', fontWeight: '600', marginTop: '0.2rem' }}>
                  Khởi tạo lúc: {formatDate(selectedOrder.createdAt || selectedOrder.orderDate)}
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

              {/* Cancellation Reason Alert Banner */}
              {selectedOrder.status === 'CANCELLED' && (selectedOrder.errorMessage || selectedOrder.message) && (
                <div style={{
                  background: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  gap: '0.85rem',
                  alignItems: 'flex-start',
                  boxShadow: 'var(--shadow-subtle)',
                  animation: 'fadeIn 0.25s ease-out'
                }}>
                  <AlertCircle size={20} color="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <h5 style={{ margin: '0 0 0.35rem 0', fontWeight: '800', color: '#ef4444', fontSize: '0.95rem' }}>
                      Lý do hủy đơn hàng (Từ hệ thống AI)
                    </h5>
                    <p style={{ margin: 0, fontSize: '0.875rem', lineHeight: '1.5', color: 'var(--text-main)', fontWeight: '600' }}>
                      {selectedOrder.errorMessage || selectedOrder.message}
                    </p>
                  </div>
                </div>
              )}

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
                  {(() => {
                    const addr = selectedOrder.shippingAddress || {};
                    const receiverName = addr.receiverName || selectedOrder.customerName || 'N/A';
                    const receiverPhone = addr.receiverPhone || selectedOrder.customerPhone || 'N/A';
                    const fullAddress = [addr.street, addr.ward, addr.city].filter(Boolean).join(', ') || selectedOrder.shippingAddress || 'N/A';

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.9rem' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Tên người nhận:</span>
                          <p style={{ fontWeight: '700', color: 'var(--text-main)', marginTop: '0.1rem' }}>{receiverName}</p>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Số điện thoại:</span>
                          <p style={{ fontWeight: '700', color: 'var(--text-main)', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Phone size={13} color="var(--text-muted)" /> {receiverPhone}
                          </p>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Địa chỉ nhận hàng:</span>
                          <p style={{ fontWeight: '600', color: 'var(--text-main)', marginTop: '0.1rem', display: 'flex', alignItems: 'flex-start', gap: '0.25rem', lineHeight: '1.4' }}>
                            <MapPin size={13} color="var(--text-muted)" style={{ marginTop: '3px', flexShrink: 0 }} />
                            {fullAddress}
                          </p>
                        </div>
                      </div>
                    );
                  })()}
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
                      <p style={{ fontWeight: '700', color: 'var(--text-main)', marginTop: '0.1rem' }}>
                        {getPaymentMethodLabel(selectedOrder.paymentMethod)}
                      </p>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Trạng thái thanh toán:</span>
                      {(() => {
                        const paymentStatus = String(selectedOrder.paymentStatus || '').toUpperCase();
                        const paymentMethod = String(selectedOrder.paymentMethod || '').toUpperCase();
                        const orderStatus = String(selectedOrder.status || '').toUpperCase();
                        
                        const isPaid = paymentStatus === 'PAID' ||
                          paymentStatus === 'SUCCESS' ||
                          selectedOrder.paymentId?.includes('SUCCESS') ||
                          selectedOrder.status === 'COMPLETED' ||
                          (paymentMethod !== 'COD' && !['PENDING', 'PAYMENT_PENDING'].includes(orderStatus));
                        return (
                          <p style={{
                            fontWeight: '800',
                            color: isPaid ? 'var(--success)' : 'var(--error)',
                            marginTop: '0.1rem',
                            display: 'inline-flex',
                            padding: '0.15rem 0.5rem',
                            background: isPaid ? 'rgba(34, 197, 94, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                            borderRadius: '4px'
                          }}>
                            {isPaid ? 'ĐÃ THANH TOÁN' : 'CHƯA THANH TOÁN'}
                          </p>
                        );
                      })()}
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
                {(() => {
                  const orderItems = selectedOrder.orderItems || selectedOrder.items || [];
                  return (
                    <>
                      <h4 style={{ fontSize: '1rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.75rem' }}>
                        Danh Sách Sản Phẩm Đặt Mua ({orderItems.length})
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
                            {orderItems.map((item, idx) => {
                              const itemId = item.productId || item.id || `item-${idx}`;
                              const itemName = item.productName || 'Sản phẩm';
                              const itemPrice = item.price || item.unitPrice || 0;
                              const itemQty = item.quantity || item.amount || 1;

                              return (
                                <tr key={itemId} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                  <td style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {item.imageUrl ? (
                                      <img
                                        src={item.imageUrl}
                                        alt={itemName}
                                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                                      />
                                    ) : (
                                      <div style={{ width: '40px', height: '40px', background: 'var(--border-color)', borderRadius: '6px' }} />
                                    )}
                                    <div>
                                      <p style={{ fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{itemName}</p>
                                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>Mã SP: {itemId}</span>
                                    </div>
                                  </td>
                                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '600' }}>
                                    {formatCurrency(itemPrice)}
                                  </td>
                                  <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: '700', color: 'var(--primary)' }}>
                                    {itemQty}
                                  </td>
                                  <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: '800', color: 'var(--text-main)' }}>
                                    {formatCurrency(itemPrice * itemQty)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  );
                })()}
              </div>

              {/* Status workflow timeline illustration */}
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '1rem' }}>
                  Tiến Trình Đơn Hàng (Đồng bộ với Khách hàng)
                </h4>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'var(--bg-light)',
                  padding: '1.25rem 1.5rem',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-color)',
                  position: 'relative',
                  overflowX: 'auto',
                  gap: '0.5rem'
                }}>
                  {(() => {
                    const status = selectedOrder.status?.toUpperCase() || 'PENDING';

                    const isStep1Active = true; // Đã đặt hàng
                    const isStep2Active = ['CONFIRMED', 'PROCESSING', 'DELIVERING', 'SHIPPING', 'COMPLETED'].includes(status); // Đã xác nhận
                    const isStep3Active = ['PROCESSING', 'DELIVERING', 'SHIPPING', 'COMPLETED'].includes(status); // Bàn giao
                    const isStep4Active = ['DELIVERING', 'SHIPPING', 'COMPLETED'].includes(status); // Đang giao
                    const isStep5Active = ['COMPLETED'].includes(status); // Hoàn thành

                    return (
                      <>
                        {/* Step 1: Đã đặt hàng */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: 'var(--primary)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '800', fontSize: '0.85rem',
                            boxShadow: '0 0 10px rgba(234, 88, 12, 0.3)'
                          }}>✓</div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '0.5rem', color: 'var(--text-main)', textAlign: 'center' }}>Đã đặt hàng</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>Chờ xác nhận</span>
                        </div>

                        <div style={{ flex: 1, height: '3px', background: isStep2Active ? 'var(--primary)' : 'var(--border-color)', minWidth: '20px', alignSelf: 'center', marginBottom: '24px' }} />

                        {/* Step 2: Đã xác nhận */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: isStep2Active ? 'var(--primary)' : 'var(--border-color)',
                            color: isStep2Active ? 'white' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '800', fontSize: '0.85rem',
                            boxShadow: isStep2Active ? '0 0 10px rgba(234, 88, 12, 0.2)' : 'none'
                          }}>{isStep2Active ? '✓' : '2'}</div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '0.5rem', color: isStep2Active ? 'var(--text-main)' : 'var(--text-muted)', textAlign: 'center' }}>Đã xác nhận</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            {isStep2Active ? 'Đã duyệt' : 'Chờ duyệt'}
                          </span>
                        </div>

                        <div style={{ flex: 1, height: '3px', background: isStep3Active ? 'var(--primary)' : 'var(--border-color)', minWidth: '20px', alignSelf: 'center', marginBottom: '24px' }} />

                        {/* Step 3: Bàn giao */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: isStep3Active ? 'var(--primary)' : 'var(--border-color)',
                            color: isStep3Active ? 'white' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '800', fontSize: '0.85rem',
                            boxShadow: isStep3Active ? '0 0 10px rgba(234, 88, 12, 0.2)' : 'none'
                          }}>{isStep3Active ? '✓' : '3'}</div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '0.5rem', color: isStep3Active ? 'var(--text-main)' : 'var(--text-muted)', textAlign: 'center' }}>Bàn giao</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            {isStep3Active ? 'Đang soạn hàng' : 'Chờ chuẩn bị'}
                          </span>
                        </div>

                        <div style={{ flex: 1, height: '3px', background: isStep4Active ? 'var(--primary)' : 'var(--border-color)', minWidth: '20px', alignSelf: 'center', marginBottom: '24px' }} />

                        {/* Step 4: Đang giao */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: isStep4Active ? 'var(--primary)' : 'var(--border-color)',
                            color: isStep4Active ? 'white' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '800', fontSize: '0.85rem',
                            boxShadow: isStep4Active ? '0 0 10px rgba(234, 88, 12, 0.2)' : 'none'
                          }}>{isStep4Active ? '✓' : '4'}</div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '0.5rem', color: isStep4Active ? 'var(--text-main)' : 'var(--text-muted)', textAlign: 'center' }}>Đang giao</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                            {isStep4Active ? 'Đang vận chuyển' : 'Chờ xuất kho'}
                          </span>
                        </div>

                        <div style={{ flex: 1, height: '3px', background: isStep5Active ? 'var(--success)' : 'var(--border-color)', minWidth: '20px', alignSelf: 'center', marginBottom: '24px' }} />

                        {/* Step 5: Hoàn thành */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                          <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: isStep5Active ? 'var(--success)' : 'var(--border-color)',
                            color: isStep5Active ? 'white' : 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: '800', fontSize: '0.85rem',
                            boxShadow: isStep5Active ? '0 0 10px rgba(34, 197, 94, 0.3)' : 'none'
                          }}>{isStep5Active ? '✓' : '5'}</div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', marginTop: '0.5rem', color: isStep5Active ? 'var(--text-main)' : 'var(--text-muted)', textAlign: 'center' }}>Hoàn thành</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>Giao thành công</span>
                        </div>
                      </>
                    );
                  })()}
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
              {(selectedOrder.status?.toUpperCase() === 'PENDING' || selectedOrder.status?.toUpperCase() === 'CONFIRMED') && (
                <Button
                  variant="primary"
                  icon={Truck}
                  onClick={() => handlePrepareOrder(selectedOrder.orderId || selectedOrder.id)}
                  isLoading={preparingOrderId === (selectedOrder.orderId || selectedOrder.id)}
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
        </div>,
        document.body
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
