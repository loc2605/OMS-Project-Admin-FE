import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = '— Chọn —',
  disabled = false,
  required = false,
  emptyMessage = 'Không có dữ liệu',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (disabled) setIsOpen(false);
  }, [disabled]);

  const displayLabel = value || placeholder;
  const hasValue = Boolean(value);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}
    >
      {label && (
        <label style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
          {label}
          {required && <span style={{ color: 'var(--error)' }}> *</span>}
        </label>
      )}

      <div style={{ position: 'relative' }}>
        <button
          type="button"
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          style={{
            width: '100%',
            padding: '0.875rem 2.5rem 0.875rem 1rem',
            borderRadius: 'var(--radius-lg)',
            border: `1px solid ${isOpen ? 'var(--primary)' : 'var(--border-color)'}`,
            backgroundColor: 'var(--bg-card)',
            color: hasValue ? 'var(--text-main)' : 'var(--text-muted)',
            outline: 'none',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: disabled ? 'not-allowed' : 'pointer',
            textAlign: 'left',
            boxShadow: isOpen ? '0 0 0 4px var(--primary-glow)' : 'none',
            opacity: disabled ? 0.6 : 1,
          }}
        >
          {options.length === 0 ? emptyMessage : displayLabel}
        </button>
        <ChevronDown
          size={18}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
            color: 'var(--text-muted)',
            pointerEvents: 'none',
            transition: 'transform 0.2s ease',
          }}
        />

        {isOpen && options.length > 0 && (
          <ul
            role="listbox"
            style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              margin: 0,
              padding: '0.35rem',
              listStyle: 'none',
              maxHeight: 'min(200px, 40vh)',
              overflowY: 'auto',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-color)',
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-xl)',
              zIndex: 20,
            }}
          >
            {options.map((option) => {
              const optionValue = typeof option === 'string' ? option : option.value;
              const optionLabel = typeof option === 'string' ? option : option.label;
              const isSelected = value === optionValue;

              return (
                <li key={optionValue} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => handleSelect(optionValue)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '0.5rem',
                      padding: '0.55rem 0.65rem',
                      border: 'none',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(242, 108, 13, 0.12)' : 'transparent',
                      color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                      fontSize: '0.9rem',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'var(--bg-main)';
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <span>{optionLabel}</span>
                    {isSelected && <Check size={16} strokeWidth={2.5} />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          value={value}
          required
          onChange={() => {}}
          style={{
            position: 'absolute',
            opacity: 0,
            height: 0,
            width: 0,
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  );
};

export default Select;
