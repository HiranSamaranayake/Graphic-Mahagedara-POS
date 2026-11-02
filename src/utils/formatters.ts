/**
 * Formats a number as Sri Lankan Rupee currency string: Rs. X,XXX
 */
export const formatCurrency = (amount: number): string => {
  const formatted = new Intl.NumberFormat('en-LK', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `Rs. ${formatted}`;
};

/**
 * Formats a date string (YYYY-MM-DD) into readable format: 27 Sep 2026
 */
export const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

/**
 * Formats percentage change string: +17.33% or -5.20%
 */
export const formatPercentage = (val: number): string => {
  const sign = val > 0 ? '+' : '';
  return `${sign}${val.toFixed(2)}%`;
};

/**
 * Formats a Year-Month string (YYYY-MM) or date string into readable month format: September 2026
 */
export const formatMonth = (yearMonthStr: string): string => {
  if (!yearMonthStr) return '';
  try {
    const parts = yearMonthStr.split('-');
    if (parts.length >= 2) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10);
      const date = new Date(year, month - 1, 1);
      return new Intl.DateTimeFormat('en-GB', {
        month: 'long',
        year: 'numeric',
      }).format(date);
    }
    return yearMonthStr;
  } catch {
    return yearMonthStr;
  }
};
