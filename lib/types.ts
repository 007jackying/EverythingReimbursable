export type ReceiptCategory =
  | 'dining'
  | 'grocery'
  | 'electronics'
  | 'travel'
  | 'transport'
  | 'healthcare'
  | 'utilities'
  | 'other'

export type ReceiptStatus = 'verified' | 'pending' | 'failed'

export interface Receipt {
  id: string
  eInvoiceId: string | null
  companyName: string
  address: string | null
  date: string
  totalAmount: number
  taxAmount: number | null
  currency: string
  paymentMethod: string | null
  paymentLast4: string | null
  category: ReceiptCategory
  imageUri: string
  cloudPath?: string | null
  confidence: number
  status: ReceiptStatus
  createdAt: string
  updatedAt?: string | null
  notes: string | null
  syncedAt?: string | null
}

export interface ExtractedReceiptData {
  companyName: string
  address: string | null
  date: string
  totalAmount: number
  taxAmount: number | null
  currency: string
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'E-Wallet' | null
  paymentLast4: string | null
  category: ReceiptCategory
  confidence: number
  eInvoiceId: string | null
}

export const APP_NAME = 'EverythingReimbursable'

export const RECENT_RECEIPTS_LIMIT = 5

export const MIN_PASSWORD_LENGTH = 6

export const STORAGE_KEYS = {
  receipts: 'receipts_v1',
  authUser: 'auth_user',
  prefCurrency: 'pref_currency'
} as const

export const CATEGORY_LABELS: Record<ReceiptCategory, string> = {
  dining: 'Dining',
  grocery: 'Grocery',
  electronics: 'Electronics',
  travel: 'Travel',
  transport: 'Transport',
  healthcare: 'Healthcare',
  utilities: 'Utilities',
  other: 'Other'
}

export const STATUS_LABELS: Record<ReceiptStatus, string> = {
  verified: 'Verified',
  pending: 'Pending',
  failed: 'Failed'
}
