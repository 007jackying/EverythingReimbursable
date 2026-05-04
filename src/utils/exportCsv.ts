import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import type { Receipt } from '@/types/receipt'

const escapeCell = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // Wrap in quotes if it contains comma, quote, or newline
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

export const exportReceiptsCsv = async (receipts: Receipt[]): Promise<void> => {
  const isAvailable = await Sharing.isAvailableAsync()
  if (!isAvailable) {
    throw new Error('Sharing is not available on this device.')
  }

  const rows = [HEADERS.join(','), ...receipts.map(receiptToRow)]
  const csv = rows.join('\n')

  const filename = `receipts_${new Date().toISOString().split('T')[0]}.csv`
  const file = new File(Paths.cache, filename)
  file.write(csv)

  await Sharing.shareAsync(file.uri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Receipts',
    UTI: 'public.comma-separated-values-text'
  })
}
