import { MIN_PASSWORD_LENGTH } from '@/constants/app'

export const validateEmail = (email: string): string | null => {
  if (!email.trim()) {
    return 'Email is required'
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    return 'Enter a valid email address'
  }
  return null
}

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'Password is required'
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`
  }
  return null
}

export const validateName = (name: string): string | null => {
  if (!name.trim()) {
    return 'Name is required'
  }
  return null
}

export const validateRequired = (value: string, fieldName: string): string | null => {
  if (!value.trim()) {
    return `${fieldName} is required`
  }
  return null
}
