import type { CategoryIconMap, ReceiptCategory } from '@/types/receipt'

export const categoryIconMap: CategoryIconMap = {
  dining: 'restaurant',
  grocery: 'local-grocery-store',
  electronics: 'devices',
  travel: 'flight',
  transport: 'directions-car',
  healthcare: 'local-hospital',
  utilities: 'bolt',
  other: 'receipt'
}

export const getCategoryIcon = (category: ReceiptCategory) => categoryIconMap[category]
