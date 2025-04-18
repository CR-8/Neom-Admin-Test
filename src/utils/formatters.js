/**
 * Utility functions for formatting data
 */

/**
 * Formats a number as currency
 * @param {number} value - The number to format
 * @param {string} [currency='INR'] - The currency code (default: INR)
 * @param {string} [locale='en-IN'] - The locale to use for formatting (default: en-IN)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'INR', locale = 'en-IN') => {
  if (value === null || value === undefined || isNaN(value)) {
    return '₹0';
  }

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `₹${value.toLocaleString('en-IN')}`;
  }
}; 