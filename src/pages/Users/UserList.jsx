import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  RefreshCw,
  Search,
  Check,
  UserCheck,
  Calendar,
  Smile,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import customerService from '../../services/customerService';
import Button from '../../components/common/Button';
import { formatDateOnly } from '../../utils/format';

const CUSTOMERS_PER_PAGE = 9;

const UserList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await customerService.getCustomers();
      console.log(">>> [API - Customers List] response:", res);
      if (res.success) {
        setCustomers(res.result);
      } else {
        toast.error("Không thể tải danh sách khách hàng.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Không thể kết nối API. Hiển thị dữ liệu giả định.");
      // Fallback mocks matching the live API response structure
      setCustomers([
        {
          id: "ef0702fd-6a9f-466e-b7c8-8b6fe756acf9",
          accountId: "36b7777c-caa6-4474-8e09-6960b1618f52",
          fullname: "Phạm Thanh Tùng",
          phone: "0339864433",
          gender: "MALE",
          dateOfBirth: "1998-06-20",
          avatarUrl: "",
          addresses: [
            {
              id: "addr-1",
              street: "139 Ly Chinh Thang",
              ward: "Phường Xuân Hòa",
              city: "Thành phố Hồ Chí Minh",
              isDefault: true
            }
          ]
        },
        {
          id: "576f828d-2e47-4879-bd86-61e10d145bec9",
          accountId: "36b7777c-caa6-4474-8e09-6960b1618f53",
          fullname: "Hữu Lộc",
          phone: "0866123456",
          gender: "MALE",
          dateOfBirth: "1995-10-12",
          avatarUrl: "",
          addresses: [
            {
              id: "addr-2",
              street: "123 Ngọc Hảo",
              ward: "",
              city: "Thành phố Hà Nội",
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

  const filteredCustomers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.fullname?.toLowerCase().includes(q) ||
        c.email?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.id?.toLowerCase().includes(q) ||
        c.accountId?.toLowerCase().includes(q)
    );
  }, [customers, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / CUSTOMERS_PER_PAGE));

  const paginatedCustomers = useMemo(() => {
    const start = currentPage * CUSTOMERS_PER_PAGE;
    return filteredCustomers.slice(start, start + CUSTOMERS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages - 1) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [currentPage, totalPages]);

  const goToPage = (pageIndex) => {
    setCurrentPage(pageIndex);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const rangeStart = filteredCustomers.length === 0 ? 0 : currentPage * CUSTOMERS_PER_PAGE + 1;
  const rangeEnd = Math.min((currentPage + 1) * CUSTOMERS_PER_PAGE, filteredCustomers.length);

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
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.2rem',
              borderRadius: '50%',
              transition: 'var(--transition)',
              outline: 'none'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={16} />
          </button>
        )}
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
        <>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: '1.25rem'
        }}>
          {paginatedCustomers.map((customer, index) => (
            <motion.div
              key={customer.id || customer.accountId || index}
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
                gap: '1rem',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Profile Top Row */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                {customer.avatarUrl ? (
                  <img 
                    src={customer.avatarUrl} 
                    alt={customer.fullname} 
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--primary)',
                      boxShadow: '0 4px 10px -2px rgba(242, 108, 13, 0.3)'
                    }}
                  />
                ) : (
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
                )}
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: '850', margin: 0, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    {customer.fullname}
                    <UserCheck size={16} color="var(--success)" />
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', marginTop: '0.15rem' }}>
                    <code style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                      ID: {customer.accountId || customer.id}
                    </code>
                  </div>
                </div>
              </div>

              {/* Profile Body Fields */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '0.85rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Mail size={15} color="var(--text-muted)" />
                  <span style={{ fontWeight: '700', color: 'var(--text-muted)', width: '70px' }}>Email:</span>
                  {customer.email ? (
                    <a href={`mailto:${customer.email}`} style={{ color: 'var(--primary)', fontWeight: '700' }}>{customer.email}</a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontWeight: '500' }}>Chưa cập nhật</span>
                  )}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <Phone size={15} color="var(--text-muted)" />
                  <span style={{ fontWeight: '700', color: 'var(--text-muted)', width: '70px' }}>Hotline:</span>
                  <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{customer.phone || 'Không có số'}</span>
                </div>

                {customer.gender && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <Smile size={15} color="var(--text-muted)" />
                    <span style={{ fontWeight: '700', color: 'var(--text-muted)', width: '70px' }}>Giới tính:</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>
                      {customer.gender === 'MALE' ? 'Nam' : customer.gender === 'FEMALE' ? 'Nữ' : customer.gender}
                    </span>
                  </div>
                )}

                {customer.dateOfBirth && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <Calendar size={15} color="var(--text-muted)" />
                    <span style={{ fontWeight: '700', color: 'var(--text-muted)', width: '70px' }}>Ngày sinh:</span>
                    <span style={{ fontWeight: '700', color: 'var(--text-main)' }}>{formatDateOnly(customer.dateOfBirth)}</span>
                  </div>
                )}
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
                    customer.addresses.map((addr, addrIdx) => (
                      <div key={addr.id || `addr-${addrIdx}`} style={{ 
                        padding: '0.5rem 0.75rem', 
                        borderRadius: '6px', 
                        background: 'var(--bg-light)', 
                        border: '1px solid var(--border-color)',
                        fontSize: '0.8rem',
                        position: 'relative'
                      }}>
                        <p style={{ margin: 0, fontWeight: '700', color: 'var(--text-main)', paddingRight: addr.isDefault ? '60px' : '0', lineHeight: '1.4' }}>
                          {addr.street}{addr.ward ? `, ${addr.ward}` : ''}{addr.city ? `, ${addr.city}` : ''}
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

        {filteredCustomers.length > CUSTOMERS_PER_PAGE && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1rem 1.25rem',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-subtle)',
            }}
          >
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Hiển thị {rangeStart}–{rangeEnd} trên tổng {filteredCustomers.length} khách hàng
              {' · '}
              Trang {currentPage + 1}/{totalPages}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
                aria-label="Trang trước"
              >
                <ChevronLeft size={16} />
                Trang trước
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                aria-label="Trang sau"
              >
                Trang sau
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
        </>
      )}

      {/* Embedded keyframe spin style */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
};

export default UserList;
