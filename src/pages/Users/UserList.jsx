import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  RefreshCw,
  Search,
  Check,
  UserCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import customerService from '../../services/customerService';
import Button from '../../components/common/Button';

const UserList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerService.getCustomers();
      if (res.success) {
        setCustomers(res.result);
      } else {
        toast.error("Không thể tải danh sách khách hàng.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết nối API. Hiển thị dữ liệu giả định.");
      // Fallback mocks matching user spec structure
      setCustomers([
        {
          id: "1162a106-567c-11f1-8df2-8ee8a4861b3a",
          fullname: "Nguyễn Văn A",
          email: "customerA@gmail.com",
          phoneNumber: "0987654321",
          addresses: [
            {
              id: "addr-1",
              street: "123 Đường Lê Lợi",
              city: "Hồ Chí Minh",
              isDefault: true
            },
            {
              id: "addr-2",
              street: "456 Đường Nguyễn Huệ",
              city: "Hồ Chí Minh",
              isDefault: false
            }
          ]
        },
        {
          id: "1162a106-567c-11f1-8df2-8ee8a4861b3b",
          fullname: "Trần Thị B",
          email: "customerB@gmail.com",
          phoneNumber: "0912345678",
          addresses: [
            {
              id: "addr-3",
              street: "789 Đường Hùng Vương",
              city: "Đà Nẵng",
              isDefault: true
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // Filter customers by name or email or phone
  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase();
    return (
      c.fullname?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phoneNumber?.includes(q)
    );
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.85rem', fontWeight: '800', margin: 0 }}>Hồ sơ khách hàng</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '600' }}>Xem thông tin định danh và địa chỉ giao nhận của khách hàng</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="secondary" icon={RefreshCw} size="sm" onClick={loadCustomers} isLoading={loading}>
            Làm mới
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        background: 'var(--bg-card)',
        padding: '0.75rem 1rem',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: 'var(--shadow-subtle)'
      }}>
        <Search size={18} color="var(--text-muted)" />
        <input 
          type="text" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm khách hàng theo tên, email hoặc số điện thoại..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            color: 'var(--text-main)',
            fontSize: '0.95rem',
            fontWeight: '600'
          }}
        />
      </div>

      {/* Loading state */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
          <span className="loader" style={{ width: '32px', height: '32px', border: '3px solid var(--primary-glow)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontWeight: '700', fontSize: '0.9rem' }}>Đang tải danh sách hồ sơ khách hàng...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div style={{ 
          padding: '4rem 2rem', 
          textAlign: 'center', 
          border: '1px dashed var(--border-color)', 
          borderRadius: 'var(--radius-xl)',
          background: 'var(--bg-card)'
        }}>
          <Users size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '0.25rem' }}>Không tìm thấy khách hàng</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Thử thay đổi từ khóa tìm kiếm khác xem sao.</p>
        </div>
      ) : (
        /* Customers grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredCustomers.map((customer, index) => (
            <motion.div
              key={customer.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                border: '1px solid var(--border-color)',
                padding: '1.5rem',
                boxShadow: 'var(--shadow-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {/* Profile Top Row */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #f26c0d 0%, #ea580c 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.25rem',
                  boxShadow: '0 4px 10px -2px rgba(242, 108, 13, 0.3)'
                }}>
                  {getInitials(customer.fullname)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {customer.fullname}
                    <UserCheck size={16} color="var(--success)" />
                  </h3>
                  <code style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600' }}>ID: {customer.id}</code>
                </div>
              </div>

              {/* Profile Body Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '0.75rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Mail size={15} color="var(--text-muted)" />
                  <span style={{ fontWeight: '700', color: 'var(--text-muted)', width: '60px' }}>Email:</span>
                  <a href={`mailto:${customer.email}`} style={{ color: 'var(--primary)', fontWeight: '700' }}>{customer.email}</a>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Phone size={15} color="var(--text-muted)" />
                  <span style={{ fontWeight: '700', color: 'var(--text-muted)', width: '60px' }}>Hotline:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{customer.phoneNumber || 'Không có số'}</span>
                </div>
              </div>

              {/* Address List inside Card */}
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--primary)', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={14} />
                  Sổ Địa Chỉ Nhận Hàng ({customer.addresses?.length || 0})
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {!customer.addresses || customer.addresses.length === 0 ? (
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: 0 }}>Khách hàng chưa đăng ký địa chỉ giao nhận.</p>
                  ) : (
                    customer.addresses.map(addr => (
                      <div key={addr.id} style={{ 
                        padding: '0.5rem 0.75rem', 
                        borderRadius: '6px', 
                        background: 'var(--bg-light)', 
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8rem',
                        position: 'relative'
                      }}>
                        <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)', paddingRight: addr.isDefault ? '60px' : '0' }}>
                          {addr.street}, {addr.city}
                        </p>
                        {addr.isDefault && (
                          <span style={{
                            position: 'absolute',
                            top: '50%',
                            right: '8px',
                            transform: 'translateY(-50%)',
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            background: 'rgba(34, 197, 94, 0.1)',
                            color: 'var(--success)',
                            padding: '0.1rem 0.4rem',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.15rem'
                          }}>
                            <Check size={8} strokeWidth={4} /> Mặc định
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
};

export default UserList;
