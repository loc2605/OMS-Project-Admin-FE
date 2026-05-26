import React, { useMemo } from 'react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { Download, Filter, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

const Orders = () => {
  const data = useMemo(() => [
    { id: 'OMS-1001', customer: 'Nguyễn Văn A', date: '2026-05-24T10:30:00', total: 1250000, status: 'Completed', payment: 'COD' },
    { id: 'OMS-1002', customer: 'Trần Thị B', date: '2026-05-25T14:20:00', total: 34990000, status: 'Processing', payment: 'Thẻ tín dụng' },
    { id: 'OMS-1003', customer: 'Lê Văn C', date: '2026-05-25T09:15:00', total: 5990000, status: 'Pending', payment: 'Chuyển khoản' },
    { id: 'OMS-1004', customer: 'Phạm Thị D', date: '2026-05-26T11:45:00', total: 19990000, status: 'Cancelled', payment: 'COD' },
    { id: 'OMS-1005', customer: 'Hoàng Văn E', date: '2026-05-26T16:00:00', total: 850000, status: 'Completed', payment: 'Ví MoMo' },
  ], []);

  const columns = useMemo(() => [
    {
      header: 'Mã Đơn Hàng',
      accessorKey: 'id',
      cell: (info) => <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{info.getValue()}</span>
    },
    {
      header: 'Khách Hàng',
      accessorKey: 'customer',
      cell: (info) => <span style={{ fontWeight: '600' }}>{info.getValue()}</span>
    },
    {
      header: 'Ngày Đặt Hàng',
      accessorKey: 'date',
      cell: (info) => formatDate(info.getValue())
    },
    {
      header: 'Tổng Giá Trị',
      accessorKey: 'total',
      cell: (info) => formatCurrency(info.getValue())
    },
    {
      header: 'Phương Thức',
      accessorKey: 'payment',
    },
    {
      header: 'Trạng Thái',
      accessorKey: 'status',
      cell: (info) => {
        const status = info.getValue();
        let displayStatus = 'Chờ xử lý';
        let color = 'var(--text-muted)';
        
        if (status === 'Completed') {
          displayStatus = 'Đã hoàn thành';
          color = 'var(--success)';
        } else if (status === 'Processing') {
          displayStatus = 'Đang giao dịch';
          color = 'var(--primary)';
        } else if (status === 'Pending') {
          displayStatus = 'Chờ duyệt';
          color = 'var(--warning)';
        } else if (status === 'Cancelled') {
          displayStatus = 'Đã hủy';
          color = 'var(--error)';
        }
        
        return (
          <span style={{ 
            padding: '0.25rem 0.6rem', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: '700',
            background: `${color}15`,
            color: color
          }}>
            {displayStatus}
          </span>
        );
      }
    },
    {
      header: 'Thao Tác',
      id: 'actions',
      cell: () => (
        <Button variant="ghost" size="sm" style={{ padding: '0.4rem', color: 'var(--text-muted)' }}>
          <Eye size={16} />
        </Button>
      )
    }
  ], []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', margin: 0 }}>Quản lý Đơn hàng</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>Theo dõi và cập nhật trạng thái đơn hàng của hệ thống</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" icon={Filter} size="sm">Bộ lọc nâng cao</Button>
          <Button variant="secondary" icon={Download} size="sm">Xuất Excel</Button>
        </div>
      </div>

      <div className="animate-fade-in">
        <Table columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Orders;
