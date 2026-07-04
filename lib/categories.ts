import type { ReceiptCategory } from './types'

// Material Symbols glyph names (web font uses snake_case)
export const categoryIconMap: Record<ReceiptCategory, string> = {
  dining: 'restaurant',
  grocery: 'shopping_cart',
  electronics: 'devices',
  travel: 'flight',
  transport: 'directions_car',
  healthcare: 'local_hospital',
  utilities: 'bolt',
  other: 'receipt_long'
}

export const getCategoryIcon = (category: ReceiptCategory) => categoryIconMap[category]
