/**
 * Formats a number to Philippine Peso (₱) string
 * Example: formatPHP(1250.5) -> "₱1,250.50"
 */
export const formatPHP = (amount) => {
  const numeric = typeof amount === 'number' ? amount : parseFloat(amount || 0);
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
};

/**
 * Formats date string to Asia/Manila display format
 * Example: formatDate("2026-03-29T10:00:00Z") -> "Mar 29, 2026 06:00 PM"
 */
export const formatDate = (dateString, includeTime = true) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'N/A';

  const options = {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit', hour12: true }),
  };

  return new Intl.DateTimeFormat('en-PH', options).format(date);
};

/**
 * Truncates long strings with ellipsis
 */
export const truncateText = (text, maxLength = 20) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
