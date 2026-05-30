import React from 'react';

const Input = React.forwardRef(({ label, error, icon: Icon, ...props }, ref) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
      {label && (
        <label style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)' }}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <Icon 
            size={18} 
            style={{ 
              position: 'absolute', 
              left: '14px', 
              color: 'var(--text-muted)' 
              // Set zIndex to ensure icon displays nicely
            }} 
          />
        )}
        <input
          ref={ref}
          style={{
            width: '100%',
            padding: Icon ? '0.875rem 1rem 0.875rem 2.75rem' : '0.875rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: `1px solid ${error ? 'var(--error)' : 'var(--border-color)'}`,
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-main)',
            outline: 'none',
            transition: 'all 0.2s ease',
            fontSize: '0.95rem',
            fontWeight: '500'
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 4px var(--primary-glow)';
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--error)' : 'var(--border-color)';
            e.target.style.boxShadow = 'none';
          }}
          {...props}
        />
      </div>
      {error && (
        <p style={{ 
          fontSize: '0.75rem', 
          color: 'var(--error)', 
          fontWeight: '700', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.25rem',
          marginTop: '0.25rem'
        }}>
          <span style={{ fontSize: '14px' }}>⚠</span> {error}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
