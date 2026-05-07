const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  MYR: 'RM',
  EUR: '€',
  GBP: '£',
  SGD: 'S$',
  JPY: '¥',
  CNY: '¥',
  AUD: 'A$',
  CAD: 'C$',
  INR: '₹'
}

export const formatAmount = (value: number, currency = 'USD') => {
  const symbol = CURRENCY_SYMBOLS[currency] || currency
  return `${symbol}${value.toFixed(2)}`
}

export { formatDate, getMonthYear } from './time'
