import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Package,
  LogOut,
  Sun,
  Moon,
  Bell
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar, theme, toggleTheme }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Tổng quan', path: '/' },
    { icon: ShoppingBag, label: 'Đơn hàng', path: '/orders' },
    { icon: Package, label: 'Sản phẩm', path: '/products' },
    { icon: Users, label: 'Khách hàng', path: '/users' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    window.location.reload();
  };

  return (
    <motion.aside
      initial={false}
      animate={{ width: isOpen ? '280px' : '88px' }}
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      {/* Logo Area */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem', // Reduced to make space for the top controls
        paddingLeft: '0.5rem',
        height: '40px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: '36px',
          height: '36px',
          background: 'var(--primary)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 8px 16px var(--primary-glow)',
          flexShrink: 0
        }}>
          <ShoppingBag size={20} />
        </div>
        {isOpen && (
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: '900', 
            color: 'var(--text-main)', 
            letterSpacing: '-0.025em',
            whiteSpace: 'nowrap'
          }}>
            ShopModern
          </span>
        )}
      </div>

    <div style={{ marginBottom: '1.5rem' }} />

      {/* Navigation Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-lg)',
              color: isActive ? 'white' : 'var(--text-muted)',
              background: isActive ? 'var(--primary)' : 'transparent',
              boxShadow: isActive ? '0 8px 20px -6px var(--primary-glow)' : 'none',
              fontWeight: isActive ? '700' : '600',
              textDecoration: 'none',
              transition: 'var(--transition)',
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            })}
            onMouseEnter={(e) => {
              const isActive = e.currentTarget.classList.contains('active');
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
                e.currentTarget.style.color = 'var(--text-main)';
              }
            }}
            onMouseLeave={(e) => {
              const isActive = e.currentTarget.classList.contains('active');
              if (!isActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            {({ isActive }) => (
              <>
                <item.icon size={22} style={{ flexShrink: 0 }} />
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Actions */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-muted)',
            fontWeight: '600',
            transition: 'var(--transition)',
            width: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)';
            e.currentTarget.style.color = 'var(--text-main)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={22} style={{ flexShrink: 0 }} />
              {isOpen && <span>Chế độ sáng</span>}
            </>
          ) : (
            <>
              <Moon size={22} style={{ flexShrink: 0 }} />
              {isOpen && <span>Chế độ tối</span>}
            </>
          )}
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.875rem 1rem',
            borderRadius: 'var(--radius-lg)',
            color: 'var(--text-muted)',
            fontWeight: '600',
            transition: 'var(--transition)',
            width: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            e.currentTarget.style.color = 'var(--error)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <LogOut size={22} style={{ flexShrink: 0 }} />
          {isOpen && <span>Đăng xuất</span>}
        </button>
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={toggleSidebar}
        style={{
          position: 'absolute',
          right: '-10px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '20px',
          height: '40px',
          borderRadius: '6px',
          background: 'var(--primary)',
          border: '3px solid var(--bg-main)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-md)',
          zIndex: 101,
          transition: 'var(--transition)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.05)';
          e.currentTarget.style.right = '-12px';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
          e.currentTarget.style.right = '-10px';
        }}
      >
        {isOpen ? <ChevronLeft size={14} strokeWidth={3} /> : <ChevronRight size={14} strokeWidth={3} />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
