import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  icon: Icon,
  ...props 
}) => {
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    fontWeight: '700',
    borderRadius: 'var(--radius-lg)',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'pointer',
    border: 'none',
    fontFamily: 'inherit',
    outline: 'none'
  };

  const variants = {
    primary: {
      backgroundColor: 'var(--primary)',
      color: 'white',
      boxShadow: '0 10px 15px -3px var(--primary-glow)',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--text-main)',
      border: '1px solid var(--border-color)',
    },
    ghost: {
      backgroundColor: 'transparent',
      color: 'var(--text-muted)',
    },
    danger: {
      backgroundColor: 'var(--error)',
      color: 'white'
    }
  };

  const sizes = {
    sm: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    md: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
    lg: { padding: '1rem 2rem', fontSize: '1.125rem' }
  };

  const hoverEffect = variant === 'primary' 
    ? { backgroundColor: '#ea580c' } // Slightly darker orange
    : { backgroundColor: 'rgba(0,0,0,0.02)' };

  return (
    <motion.button
      whileHover={{ ...hoverEffect, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      style={{
        ...baseStyles,
        ...variants[variant],
        ...sizes[size],
        ...props.style
      }}
      className={className}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="loader" style={{ width: '18px', height: '18px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 18 : 20} />}
          {children}
        </>
      )}
    </motion.button>
  );
};

export default Button;
