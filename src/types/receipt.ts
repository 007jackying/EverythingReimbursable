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
  driveFileId?: string | null
  driveWebViewLink?: string | null
  confidence: number
  status: ReceiptStatus
  createdAt: string
  updatedAt?: string | null
  notes: string | null
  syncedAt?: string | null
}

export type CategoryIconMap = {
  [key in ReceiptCategory]: string
}
