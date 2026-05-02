import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Settings,
  ChevronLeft,
  ChevronRight,
  Package,
  LogOut
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: ShoppingBag, label: 'Orders', path: '/orders' },
    { icon: Package, label: 'Products', path: '/products' },
    { icon: Users, label: 'Customers', path: '/users' },
    { icon: Settings, label: 'Settings', path: '/settings' },
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
        position: 'relative',
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
        marginBottom: '2.5rem',
        paddingLeft: '0.75rem',
        overflow: 'hidden'
      }}>
        <div style={{
          minWidth: '32px',
          height: '32px',
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
          </svg>
        </div>
        {isOpen && (
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ fontSize: '1.25rem', fontWeight: '800', whiteSpace: 'nowrap', color: 'var(--text-main)' }}
          >
            Shop<span style={{ color: 'var(--primary)' }}>Modern</span>
          </motion.h2>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        {menuItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.path}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.875rem 1rem',
              borderRadius: 'var(--radius-lg)',
              color: isActive ? 'white' : 'var(--text-muted)',
              backgroundColor: isActive ? 'var(--primary)' : 'transparent',
              textDecoration: 'none',
              fontWeight: isActive ? '700' : '600',
              transition: 'var(--transition)',
              boxShadow: isActive ? '0 10px 15px -3px var(--primary-glow)' : 'none',
              overflow: 'hidden'
            })}
          >
            {({ isActive }) => (
              <>
                <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{ whiteSpace: 'nowrap', fontSize: '1rem' }}
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
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
          <LogOut size={22} />
          {isOpen && <span>Logout</span>}
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
