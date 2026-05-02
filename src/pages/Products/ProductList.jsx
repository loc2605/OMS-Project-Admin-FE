import React, { useMemo } from 'react';
import Table from '../../components/common/Table';
import Button from '../../components/common/Button';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

const Products = () => {
  const data = useMemo(() => [
    { id: 1, name: 'iPhone 15 Pro Max', category: 'Smartphone', price: 34990000, stock: 12, status: 'In Stock' },
    { id: 2, name: 'MacBook Pro M3', category: 'Laptop', price: 45990000, stock: 5, status: 'In Stock' },
    { id: 3, name: 'iPad Pro 12.9', category: 'Tablet', price: 28990000, stock: 0, status: 'Out of Stock' },
    { id: 4, name: 'AirPods Pro 2', category: 'Accessories', price: 5990000, stock: 45, status: 'In Stock' },
    { id: 5, name: 'Apple Watch Ultra', category: 'Accessories', price: 19990000, stock: 8, status: 'In Stock' },
  ], []);

  const columns = useMemo(() => [
    {
      header: 'ID',
      accessorKey: 'id',
    },
    {
      header: 'Product Name',
      accessorKey: 'name',
      cell: (info) => <span style={{ fontWeight: '600' }}>{info.getValue()}</span>
    },
    {
      header: 'Category',
      accessorKey: 'category',
    },
    {
      header: 'Price',
      accessorKey: 'price',
      cell: (info) => formatCurrency(info.getValue())
    },
    {
      header: 'Stock',
      accessorKey: 'stock',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (info) => {
        const status = info.getValue();
        const color = status === 'In Stock' ? 'var(--success)' : 'var(--error)';
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
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="ghost" size="sm" style={{ padding: '0.4rem', color: 'var(--text-muted)' }}><Eye size={16} /></Button>
          <Button variant="ghost" size="sm" style={{ padding: '0.4rem', color: 'var(--primary)' }}><Edit size={16} /></Button>
          <Button variant="ghost" size="sm" style={{ padding: '0.4rem', color: 'var(--error)' }}><Trash2 size={16} /></Button>
        </div>
      )
    }
  ], []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Products</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Manage your store's product inventory</p>
        </div>
        <Button icon={Plus}>Add Product</Button>
      </div>

      <div className="animate-fade-in">
        <Table columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Products;
