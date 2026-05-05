import { render, RenderOptions } from '@testing-library/react-native'
import React from 'react'

// Custom render function that includes providers if needed
const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) => {
  return render(ui, { ...options })
}

// Re-export everything from testing library
export * from '@testing-library/react-native'

// Override render method
export { customRender as render }

// Helper to create mock receipt data
export const createMockReceipt = (overrides = {}) => ({
  id: 'test-id',
  eInvoiceId: null,
  companyName: 'Test Merchant',
  address: '123 Test St',
  date: '2024-01-01',
  totalAmount: 100.0,
  taxAmount: 10.0,
  currency: 'USD',
  paymentMethod: 'Credit Card',
  paymentLast4: '4242',
  category: 'dining' as const,
  imageUri: 'test://image.jpg',
  confidence: 0.95,
  status: 'verified' as const,
  createdAt: '2024-01-01T00:00:00Z',
  notes: null,
  ...overrides
})

// Helper to create mock user data
export const createMockUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  ...overrides
})

// Wait for async updates
export const waitFor = () => new Promise(resolve => setTimeout(resolve, 0))