import React from 'react';
import { Bell, Moon, Sun } from 'lucide-react';

const Navbar = ({ theme, toggleTheme }) => {
  return (
    <header style={{ 
      padding: '0 1.5rem', 
      display: 'flex',
      justifyContent: 'flex-end', // Align all actions to the far right
      alignItems: 'center',
      background: 'var(--bg-main)',
      borderBottom: '1px solid var(--border-color)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      height: '56px' // Made slightly more compact and elegant
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Dark/Light mode Toggle */}
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
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.color = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications */}
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
            transition: 'var(--transition)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--primary)';
            e.currentTarget.style.color = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-color)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
          >
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
      </div>
    </header>
  );
};

export default Navbar;
