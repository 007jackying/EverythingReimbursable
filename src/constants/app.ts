export const APP_NAME = 'EverythingReimbursable'

export const RECENT_RECEIPTS_LIMIT = 5

export const MIN_PASSWORD_LENGTH = 6

export const GEMINI_MODEL = 'gemini-3-pro-preview'

export const STORAGE_KEYS = {
  receipts: 'receipts_v1',
  authUser: 'auth_user',
  hasOnboarded: 'has_onboarded_v1',
  googleToken: 'google_access_token',
  googleUser: 'google_user',
  prefCurrency: 'pref_currency'
} as const

export const CATEGORY_LABELS: Record<string, string> = {
  dining: 'Dining',
  grocery: 'Grocery',
  electronics: 'Electronics',
  travel: 'Travel',
  transport: 'Transport',
  healthcare: 'Healthcare',
  utilities: 'Utilities',
  other: 'Other'
} as const

export const STATUS_LABELS: Record<string, string> = {
  verified: 'Verified',
  pending: 'Pending',
  failed: 'Failed'
} as const
