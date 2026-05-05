// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('base64data')
}))

// Mock fetch globally
global.fetch = jest.fn()

// Mock Google Generative AI
jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: jest.fn()
    }))
  }))
}))

import { GoogleGenerativeAI } from '@google/generative-ai'
import { extractReceiptData } from '@/services/gemini'

describe('Gemini AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY
  })

  describe('extractReceiptData', () => {
    it('returns mock data when API key is not set', async () => {
      delete process.env.EXPO_PUBLIC_GEMINI_API_KEY

      const result = await extractReceiptData('test://image.jpg')

      expect(result.companyName).toBe('Blue Bottle Coffee')
      expect(result.totalAmount).toBe(42.5)
      expect(result.confidence).toBe(0.984)
    })

    it('returns mock data when model is not initialized', async () => {
      const result = await extractReceiptData('test://image.jpg')

      // Since we're mocking, it should fall back to mock data
      expect(result).toHaveProperty('companyName')
      expect(result).toHaveProperty('totalAmount')
      expect(result).toHaveProperty('category')
      expect(result).toHaveProperty('confidence')
    })

    it('includes all required fields in response', async () => {
      const result = await extractReceiptData('test://image.jpg')

      expect(result).toMatchObject({
        companyName: expect.any(String),
        address: expect.anything(),
        totalAmount: expect.any(Number),
        taxAmount: expect.anything(),
        currency: expect.any(String),
        paymentMethod: expect.anything(),
        paymentLast4: expect.anything(),
        category: expect.any(String),
        confidence: expect.any(Number),
        eInvoiceId: expect.anything()
      })
    })

    it('returns valid category', async () => {
      const result = await extractReceiptData('test://image.jpg')

      const validCategories = [
        'dining',
        'grocery',
        'electronics',
        'travel',
        'transport',
        'healthcare',
        'utilities',
        'other'
      ]

      expect(validCategories).toContain(result.category)
    })

    it('returns confidence between 0 and 1', async () => {
      const result = await extractReceiptData('test://image.jpg')

      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('returns valid currency code', async () => {
      const result = await extractReceiptData('test://image.jpg')

      expect(result.currency).toMatch(/^[A-Z]{3}$/)
    })
  })

  describe('error handling', () => {
    it('handles missing image URI gracefully', async () => {
      const result = await extractReceiptData('')

      expect(result).toHaveProperty('companyName')
      expect(result).toHaveProperty('totalAmount')
    })

    it('falls back to mock data on error', async () => {
      // Mock an error scenario
      const result = await extractReceiptData('invalid://image')

      expect(result).toHaveProperty('companyName')
      expect(result.confidence).toBeGreaterThanOrEqual(0)
    })
  })
})