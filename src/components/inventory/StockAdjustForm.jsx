import React from 'react';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import { STOCK_ACTIONS, getStockAction } from '../../constants/stockActions';

const ACTION_ICONS = {
  IMPORT: ArrowDownToLine,
  REDUCE: ArrowUpFromLine,
};

const StockAdjustForm = ({
  action,
  onActionChange,
  quantity,
  onQuantityChange,
  onSubmit,
  onCancel,
  submitting,
  inventoryDetails,
  loading,
}) => {
  if (loading) {
    return (
      <div style={{ padding: '2rem 0', textAlign: 'center' }}>
        <span
          className="loader"
          style={{
            width: 24,
            height: 24,
            border: '3px solid var(--primary-glow)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            display: 'inline-block',
          }}
        />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 700 }}>
          Đang tải tồn kho...
        </p>
      </div>
    );
  }

  if (!inventoryDetails) {
    return (
      <p style={{ textAlign: 'center', color: 'var(--error)', fontWeight: 700, margin: 0 }}>
        Không tải được thông tin tồn kho.
      </p>
    );
  }

  const currentAction = getStockAction(action);
  const isBelowThreshold =
    inventoryDetails.availableQuantity <= inventoryDetails.lowStockThreshold;

  return (
    <div>
      <div
        style={{
          textAlign: 'center',
          padding: '1.1rem 1rem',
          borderRadius: 12,
          border: `2px solid ${isBelowThreshold ? 'var(--error)' : 'var(--success)'}`,
          background: isBelowThreshold ? 'rgba(239, 68, 68, 0.06)' : 'rgba(34, 197, 94, 0.06)',
          marginBottom: '0.75rem',
        }}
      >
        <span
          style={{
            display: 'block',
            fontSize: '2rem',
            fontWeight: 800,
            lineHeight: 1.1,
            color: isBelowThreshold ? 'var(--error)' : 'var(--success)',
          }}
        >
          {inventoryDetails.availableQuantity}
        </span>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          Tồn kho khả dụng
        </span>
        {isBelowThreshold && (
          <span
            style={{
              display: 'block',
              marginTop: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: 800,
              color: 'var(--error)',
            }}
          >
            Dưới ngưỡng cảnh báo ({inventoryDetails.lowStockThreshold})
          </span>
        )}
      </div>

      <p
        style={{
          margin: '0 0 1.1rem',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          fontWeight: 600,
          lineHeight: 1.5,
        }}
      >
        Đang giữ cho đơn:{' '}
        <strong style={{ color: 'var(--text-main)' }}>{inventoryDetails.reservedQuantity}</strong>
        {' · '}
        Tổng trong kho:{' '}
        <strong style={{ color: 'var(--text-main)' }}>{inventoryDetails.totalQuantity}</strong>
        <br />
        <span style={{ fontSize: '0.72rem' }}>
          Hàng đang giữ do hệ thống cập nhật qua đơn hàng — không chỉnh tại đây.
        </span>
      </p>

      <form
        onSubmit={onSubmit}
        style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1.15rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.9rem',
        }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 800 }}>Chọn thao tác</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          {STOCK_ACTIONS.map((stockAction) => {
            const Icon = ACTION_ICONS[stockAction.id];
            const isSelected = action === stockAction.id;
            return (
              <button
                key={stockAction.id}
                type="button"
                onClick={() => onActionChange(stockAction.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.7rem 0.5rem',
                  borderRadius: 10,
                  border: `2px solid ${isSelected ? stockAction.color : 'var(--border-color)'}`,
                  background: isSelected ? stockAction.background : 'var(--bg-card)',
                  color: isSelected ? stockAction.color : 'var(--text-muted)',
                  cursor: 'pointer',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                }}
              >
                <Icon size={20} strokeWidth={2.25} />
                {stockAction.label}
              </button>
            );
          })}
        </div>

        <p
          style={{
            margin: 0,
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            fontWeight: 600,
            lineHeight: 1.45,
            padding: '0.6rem 0.75rem',
            background: 'var(--bg-main)',
            borderRadius: 8,
            border: '1px solid var(--border-color)',
          }}
        >
          {currentAction.hint}
        </p>

        <Input
          label="Số lượng"
          type="number"
          min="1"
          style={{ padding: '0.75rem' }}
          value={quantity}
          onChange={(e) => onQuantityChange(e.target.value)}
          required
        />

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button type="button" variant="secondary" onClick={onCancel} style={{ flex: 1 }}>
            Hủy
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={submitting}
            style={{
              flex: 1,
              ...(action === 'REDUCE' ? { background: 'var(--warning)' } : {}),
            }}
          >
            {currentAction.submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default StockAdjustForm;
