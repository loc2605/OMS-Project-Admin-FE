/**
 * Format number to Vietnamese currency (VNĐ)
 * @param {number} amount 
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  const num = Number(amount);
  if (amount === null || amount === undefined || isNaN(num)) {
    return '0 ₫';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num);
};

/**
 * Format date to local string
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  try {
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) {
      return 'N/A';
    }
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(parsedDate);
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Capitalize first letter
 * @param {string} str 
 * @returns {string}
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};
