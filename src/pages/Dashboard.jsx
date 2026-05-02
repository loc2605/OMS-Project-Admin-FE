import React from 'react';
import { 
  DollarSign, 
  Users, 
  ShoppingBag, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, change, icon: Icon, isPositive, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    style={{
      background: 'var(--bg-card)',
      padding: '1.5rem',
      borderRadius: 'var(--radius-xl)',
      border: '1px solid var(--border-color)',
      boxShadow: 'var(--shadow-subtle)',
      flex: 1,
      minWidth: '220px',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
      <div style={{ 
        width: '44px', 
        height: '44px', 
        borderRadius: '12px', 
        background: 'var(--primary)', 
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 10px -2px var(--primary-glow)'
      }}>
        <Icon size={22} />
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.25rem',
        padding: '0.3rem 0.6rem',
        borderRadius: 'var(--full)',
        background: isPositive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
        color: isPositive ? 'var(--success)' : 'var(--error)',
        fontSize: '0.8rem',
        fontWeight: '800',
        height: 'fit-content'
      }}>
        {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {change}
      </div>
    </div>
    
    <div>
      <h3 style={{ fontSize: '1.85rem', fontWeight: '800', margin: '0 0 0.25rem 0', color: 'var(--text-main)', letterSpacing: '-0.02em' }}>{value}</h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '600', margin: 0 }}>{title}</p>
    </div>

    <div style={{ 
      position: 'absolute', 
      bottom: '-10px', 
      right: '-10px', 
      opacity: 0.03, 
      color: 'var(--text-main)',
      transform: 'rotate(-15deg)'
    }}>
      <Icon size={90} />
    </div>
  </motion.div>
);

const Dashboard = () => {
  const stats = [
    { title: 'Total Revenue', value: '₫ 128.5M', change: '+12.5%', icon: DollarSign, isPositive: true },
    { title: 'New Customers', value: '2,453', change: '+3.2%', icon: Users, isPositive: true },
    { title: 'Successful Orders', value: '856', change: '+8.1%', icon: ShoppingBag, isPositive: true },
    { title: 'Conversion Rate', value: '3.24%', change: '1.2%', icon: TrendingUp, isPositive: false },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
      {/* Welcome Banner - Compact but readable */}
      <div style={{ 
        background: 'var(--primary)', 
        borderRadius: 'var(--radius-xl)', 
        padding: '2rem 2.5rem', 
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 25px -5px var(--primary-glow)'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <span style={{ 
            display: 'inline-block', 
            background: 'white', 
            color: 'var(--primary)', 
            padding: '0.25rem 0.75rem', 
            borderRadius: 'var(--full)', 
            fontSize: '0.75rem', 
            fontWeight: '800', 
            textTransform: 'uppercase',
            marginBottom: '0.75rem'
          }}>Management System</span>
          <h2 style={{ fontSize: '2.25rem', fontWeight: '900', marginBottom: '0.5rem', color: 'white', lineHeight: '1.1' }}>Welcome back, Admin!</h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, fontWeight: '500' }}>You have 24 new orders and 5 pending customers today.</p>
        </div>
        
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          opacity: 0.1, 
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', 
          backgroundSize: '30px 30px',
          zIndex: 1
        }}></div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} index={i} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', flex: 1 }}>
        {/* Recent Orders Table */}
        <div style={{ 
          background: 'var(--bg-card)', 
          padding: '1.5rem', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Recent Orders</h3>
            <button style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: '800' }}>View All →</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingBottom: '1rem',
                borderBottom: i !== 4 ? '1px solid var(--border-color)' : 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ 
                    width: '44px', 
                    height: '44px', 
                    borderRadius: '10px', 
                    background: 'var(--bg-light)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    <ShoppingBag size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <p style={{ fontWeight: '800', fontSize: '1rem', margin: 0 }}>#OMS-823{i}</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', margin: 0 }}>Customer Name • 2m</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: '800', fontSize: '1.1rem', margin: 0 }}>₫ 1.25M</p>
                  <span style={{ fontSize: '0.75rem', fontWeight: '800', color: i % 2 === 0 ? 'var(--success)' : 'var(--warning)' }}>{i % 2 === 0 ? 'DONE' : 'PENDING'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Growth Chart Mockup */}
        <div style={{ 
          background: 'var(--bg-card)', 
          padding: '1.5rem', 
          borderRadius: 'var(--radius-xl)', 
          border: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800' }}>Revenue Overview</h3>
          </div>
          <div style={{ 
            flex: 1, 
            minHeight: '220px', 
            background: 'var(--bg-light)', 
            borderRadius: 'var(--radius-lg)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            border: '1px dashed var(--border-color)'
          }}>
            <TrendingUp size={64} style={{ color: 'var(--primary)', opacity: 0.1 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
