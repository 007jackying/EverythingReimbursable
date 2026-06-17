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

export const getCurrencySymbol = (currency = 'USD') => CURRENCY_SYMBOLS[currency] || currency

export const formatAmount = (value: number, currency = 'USD') =>
  `${getCurrencySymbol(currency)}${value.toFixed(2)}`

export { formatDate, getMonthYear } from './time'
