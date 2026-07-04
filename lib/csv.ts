import type { Receipt } from './types'

const escapeCell = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

const HEADERS = [
  'ID',
  'Date',
  'Merchant',
  'Address',
  'Total Amount',
  'Tax Amount',
  'Currency',
  'Category',
  'Payment Method',
  'Card Last 4',
  'Status',
  'AI Confidence',
  'E-Invoice ID',
  'Notes',
  'Created At'
]

const receiptToRow = (r: Receipt): string =>
  [
    r.id,
    r.date,
    r.companyName,
    r.address,
    r.totalAmount.toFixed(2),
    r.taxAmount?.toFixed(2) ?? '',
    r.currency,
    r.category,
    r.paymentMethod,
    r.paymentLast4,
    r.status,
    `${(r.confidence * 100).toFixed(1)}%`,
    r.eInvoiceId,
    r.notes,
    r.createdAt
  ]
    .map(escapeCell)
    .join(',')

export const exportReceiptsCsv = (receipts: Receipt[]): void => {
  const csv = [HEADERS.join(','), ...receipts.map(receiptToRow)].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `receipts_${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
