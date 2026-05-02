import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Navbar from '../components/layout/Navbar';

const AdminLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('light');
  const location = useLocation();

  const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    const title = path.split('/')[1];
    return title.charAt(0).toUpperCase() + title.slice(1);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)', transition: 'background-color 0.3s ease' }}>
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div style={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column',
        maxWidth: isSidebarOpen ? 'calc(100vw - 280px)' : 'calc(100vw - 88px)',
        transition: 'all 0.3s ease'
      }}>
        <Navbar 
          activePage={getPageTitle()} 
          theme={theme} 
          toggleTheme={toggleTheme} 
        />
        
        <main style={{ 
          flex: 1, 
          padding: '1.25rem', 
          overflowY: 'auto',
          background: 'var(--bg-main)',
          height: 'calc(100vh - 64px)'
        }}>
          <div className="animate-fade-in" style={{ maxWidth: '1600px', margin: '0 auto', height: '100%' }}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
