/** Admin stock adjustment actions — UI copy is Vietnamese; code identifiers are English. */
export const STOCK_ACTIONS = [
  {
    id: 'IMPORT',
    apiType: 'ADD',
    label: 'Nhập kho',
    hint: 'Tăng tồn khả dụng khi nhận hàng từ nhà cung cấp.',
    submitLabel: 'Xác nhận nhập',
    color: 'var(--success)',
    background: 'rgba(34, 197, 94, 0.1)',
  },
  {
    id: 'REDUCE',
    apiType: 'REDUCE',
    label: 'Trừ tồn',
    hint: 'Giảm tồn khả dụng: xuất hàng, chuyển kho, hủy hỏng hoặc kiểm kê.',
    submitLabel: 'Xác nhận trừ',
    color: 'var(--warning)',
    background: 'rgba(245, 158, 11, 0.1)',
    confirmMessage:
      'Bạn chắc chắn muốn trừ số lượng này khỏi tồn kho khả dụng?',
  },
];

export const getStockAction = (actionId) =>
  STOCK_ACTIONS.find((action) => action.id === actionId) ?? STOCK_ACTIONS[0];

export const getStockApiType = (actionId) => getStockAction(actionId).apiType;
