import { MIN_PASSWORD_LENGTH } from './types'

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

export const formatDate = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const getMonthYear = (isoDate: string): string =>
  new Date(isoDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()

export const isCurrentMonth = (isoDate: string): boolean => {
  const d = new Date(isoDate)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}

export const getGreeting = (): string => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) return 'Email is required'
  if (!/\S+@\S+\.\S+/.test(email)) return 'Enter a valid email address'
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) return 'Password is required'
  if (password.length < MIN_PASSWORD_LENGTH)
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  return null
}

export const validateName = (name: string): string | null =>
  name.trim() ? null : 'Name is required'
