import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light');

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', transition: 'background-color 0.3s ease' }}>
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        maxWidth: isSidebarOpen ? 'calc(100vw - 280px)' : 'calc(100vw - 88px)',
        transition: 'all 0.3s ease'
      }}>
        <main style={{ 
          flex: 1,
          overflowY: 'auto',
          background: 'var(--bg-main)',
          height: '100vh'
        }}>
          <div className="animate-fade-in" style={{ maxWidth: '1600px', margin: '0 auto', padding: '1.5rem 2rem', minHeight: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
