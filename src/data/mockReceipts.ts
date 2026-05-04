import type { Receipt } from '@/types/receipt'

export const mockReceipts: Receipt[] = [
  {
    id: '1',
    eInvoiceId: 'INV-US-2023-88910-XQ9',
    companyName: 'Blue Bottle Coffee',
    address: '300 S Broadway, Los Angeles, CA',
    date: '2024-10-24',
    totalAmount: 42.5,
    taxAmount: 3.75,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    paymentLast4: '4242',
    category: 'dining',
    imageUri: '',
    confidence: 0.984,
    status: 'verified',
    createdAt: '2024-10-24T08:30:00Z',
    notes: null
  },
  {
    id: '2',
    eInvoiceId: null,
    companyName: 'Uber',
    address: null,
    date: '2024-10-22',
    totalAmount: 18.42,
    taxAmount: 1.6,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    paymentLast4: '4242',
    category: 'transport',
    imageUri: '',
    confidence: 0.921,
    status: 'verified',
    createdAt: '2024-10-22T14:15:00Z',
    notes: null
  },
  {
    id: '3',
    eInvoiceId: null,
    companyName: 'Whole Foods Market',
    address: '234 E 34th St, New York, NY',
    date: '2024-10-20',
    totalAmount: 156.83,
    taxAmount: 13.8,
    currency: 'USD',
    paymentMethod: 'Debit Card',
    paymentLast4: '1234',
    category: 'grocery',
    imageUri: '',
    confidence: 0.967,
    status: 'verified',
    createdAt: '2024-10-20T11:00:00Z',
    notes: null
  },
  {
    id: '4',
    eInvoiceId: null,
    companyName: 'Marriott Hotel',
    address: '5400 Mowry Ave, Newark, CA',
    date: '2024-10-15',
    totalAmount: 389.0,
    taxAmount: 34.2,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    paymentLast4: '4242',
    category: 'travel',
    imageUri: '',
    confidence: 0.742,
    status: 'pending',
    createdAt: '2024-10-15T16:00:00Z',
    notes: 'Business trip - San Francisco'
  },
  {
    id: '5',
    eInvoiceId: 'INV-US-2023-77234-KL2',
    companyName: 'Apple Store',
    address: '1 Infinite Loop, Cupertino, CA',
    date: '2024-10-12',
    totalAmount: 1299.0,
    taxAmount: 114.12,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    paymentLast4: '4242',
    category: 'electronics',
    imageUri: '',
    confidence: 0.995,
    status: 'verified',
    createdAt: '2024-10-12T10:30:00Z',
    notes: null
  },
  {
    id: '6',
    eInvoiceId: null,
    companyName: 'CVS Pharmacy',
    address: '456 Main St, Boston, MA',
    date: '2024-09-28',
    totalAmount: 34.97,
    taxAmount: 2.8,
    currency: 'USD',
    paymentMethod: 'Cash',
    paymentLast4: null,
    category: 'healthcare',
    imageUri: '',
    confidence: 0.856,
    status: 'pending',
    createdAt: '2024-09-28T09:15:00Z',
    notes: null
  },
  {
    id: '7',
    eInvoiceId: null,
    companyName: 'Con Edison',
    address: '4 Irving Pl, New York, NY',
    date: '2024-09-15',
    totalAmount: 142.3,
    taxAmount: null,
    currency: 'USD',
    paymentMethod: 'E-Wallet',
    paymentLast4: null,
    category: 'utilities',
    imageUri: '',
    confidence: 0.934,
    status: 'verified',
    createdAt: '2024-09-15T00:00:00Z',
    notes: 'Monthly utility bill'
  },
  {
    id: '8',
    eInvoiceId: null,
    companyName: 'Shake Shack',
    address: '691 8th Ave, New York, NY',
    date: '2024-09-10',
    totalAmount: 27.84,
    taxAmount: 2.45,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    paymentLast4: '4242',
    category: 'dining',
    imageUri: '',
    confidence: 0.978,
    status: 'verified',
    createdAt: '2024-09-10T12:30:00Z',
    notes: null
  }
]

export const formatAmount = (value: number, currency = 'USD') => {
  const symbol = currency === 'USD' ? '$' : currency
  return `${symbol}${value.toFixed(2)}`
}

export const formatDate = (isoDate: string) => {
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export const getMonthYear = (isoDate: string) => {
  const d = new Date(isoDate)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
}
