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
  confidence: number
  status: ReceiptStatus
  createdAt: string
  notes: string | null
}

export type CategoryIconMap = {
  [key in ReceiptCategory]: string
}
