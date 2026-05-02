import React, { useMemo } from 'react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { Download, Filter, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

const Orders = () => {
  const data = useMemo(() => [
    { id: 'OMS-1001', customer: 'Nguyễn Văn A', date: '2026-05-01T10:30:00', total: 1250000, status: 'Completed', payment: 'COD' },
    { id: 'OMS-1002', customer: 'Trần Thị B', date: '2026-05-01T14:20:00', total: 34990000, status: 'Processing', payment: 'Credit Card' },
    { id: 'OMS-1003', customer: 'Lê Văn C', date: '2026-05-02T09:15:00', total: 5990000, status: 'Pending', payment: 'Bank Transfer' },
    { id: 'OMS-1004', customer: 'Phạm Thị D', date: '2026-05-02T11:45:00', total: 19990000, status: 'Cancelled', payment: 'COD' },
    { id: 'OMS-1005', customer: 'Hoàng Văn E', date: '2026-05-02T16:00:00', total: 850000, status: 'Completed', payment: 'MoMo' },
  ], []);

  const columns = useMemo(() => [
    {
      header: 'Order ID',
      accessorKey: 'id',
      cell: (info) => <span style={{ fontWeight: '700', color: 'var(--primary)' }}>{info.getValue()}</span>
    },
    {
      header: 'Customer',
      accessorKey: 'customer',
      cell: (info) => <span style={{ fontWeight: '600' }}>{info.getValue()}</span>
    },
    {
      header: 'Order Date',
      accessorKey: 'date',
      cell: (info) => formatDate(info.getValue())
    },
    {
      header: 'Total Amount',
      accessorKey: 'total',
      cell: (info) => formatCurrency(info.getValue())
    },
    {
      header: 'Payment',
      accessorKey: 'payment',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info) => {
        const status = info.getValue();
        let color = 'var(--text-muted)';
        if (status === 'Completed') color = 'var(--success)';
        if (status === 'Processing') color = 'var(--primary)';
        if (status === 'Pending') color = 'var(--warning)';
        if (status === 'Cancelled') color = 'var(--error)';
        
        return (
          <span style={{ 
            padding: '0.25rem 0.6rem', 
            borderRadius: '20px', 
            fontSize: '0.75rem', 
            fontWeight: '700',
            background: `${color}15`,
            color: color
          }}>
            {status}
          </span>
        );
      }
    },
    {
      header: 'Actions',
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
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Orders</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Track and manage all customer orders</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" icon={Filter}>Filters</Button>
          <Button variant="secondary" icon={Download}>Export Excel</Button>
        </div>
      </div>

      <div className="animate-fade-in">
        <Table columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Orders;
