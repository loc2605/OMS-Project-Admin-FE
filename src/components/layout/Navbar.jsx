import React from 'react';
import { Bell, Search, Moon, Sun, User } from 'lucide-react';

const Navbar = ({ activePage, theme, toggleTheme }) => {
  return (
    <header style={{ 
      padding: '0.75rem 1.5rem', 
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'var(--bg-main)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: '64px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>
          <span>Admin Panel</span> / <span>{activePage}</span>
        </div>
        <h1 style={{ fontSize: '1.5rem', margin: 0, color: 'var(--text-main)', fontWeight: '800' }}>{activePage}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <Search 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '14px', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: 'var(--text-muted)' 
            }} 
          />
          <input 
            type="text" 
            placeholder="Search everything..." 
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '0.65rem 1rem 0.65rem 3rem',
              color: 'var(--text-main)',
              width: '280px',
              outline: 'none',
              fontSize: '0.95rem',
              fontWeight: '500',
              transition: 'var(--transition)'
            }}
          />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button 
            onClick={toggleTheme}
            style={{ 
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-lg)', 
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-card)',
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <div style={{ position: 'relative', cursor: 'pointer' }}>
            <div style={{ 
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-lg)', 
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--bg-card)',
            }}>
              <Bell size={18} />
            </div>
            <div style={{ 
              position: 'absolute', 
              top: '8px', 
              right: '8px', 
              width: '6px', 
              height: '6px', 
              background: 'var(--primary)', 
              borderRadius: '50%',
              border: '1.5px solid var(--bg-main)'
            }} />
          </div>

          <div style={{ 
            height: '36px',
            padding: '0 0.6rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            background: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', background: 'var(--bg-light)' }}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Admin" style={{ width: '100%', height: '100%' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700' }}>Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
