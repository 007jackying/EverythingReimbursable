import type { ExtractedReceiptData } from '@/services/gemini'

const mockGenerateContent = jest.fn()

jest.mock('expo-file-system/legacy', () => ({
  readAsStringAsync: jest.fn().mockResolvedValue('base64data'),
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true, size: 1024 }),
  copyAsync: jest.fn().mockResolvedValue(undefined),
  cacheDirectory: 'file:///cache/',
  EncodingType: { Base64: 'base64' }
}))

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn(() => ({
      generateContent: mockGenerateContent
    }))
  }))
}))

// The service reads EXPO_PUBLIC_GEMINI_API_KEY at module load, so each test
// loads a fresh copy of the module after configuring the environment.
const loadExtractReceiptData = (): ((uri: string) => Promise<ExtractedReceiptData>) => {
  let extract: ((uri: string) => Promise<ExtractedReceiptData>) | undefined
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    extract = require('@/services/gemini').extractReceiptData
  })
  return extract!
}

const mockModelResponse = (payload: object | string) => {
  const text = typeof payload === 'string' ? payload : JSON.stringify(payload)
  mockGenerateContent.mockResolvedValue({ response: { text: () => text } })
}

const fullReceiptJson = {
  companyName: 'Blue Bottle Coffee',
  address: '123 Main St',
  date: '2024-10-24',
  totalAmount: 42.5,
  taxAmount: 2.5,
  currency: 'USD',
  paymentMethod: 'Credit Card',
  paymentLast4: '4242',
  eInvoiceId: 'INV-001',
  confidence: 0.98
}

describe('Gemini AI Service', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.EXPO_PUBLIC_GEMINI_API_KEY = 'test-api-key'
  })

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_GEMINI_API_KEY
  })

  describe('extractReceiptData', () => {
    it('throws when API key is not set', async () => {
      delete process.env.EXPO_PUBLIC_GEMINI_API_KEY
      const extractReceiptData = loadExtractReceiptData()

      await expect(extractReceiptData('test://image.jpg')).rejects.toThrow(
        'Gemini AI not initialized'
      )
    })

    it('extracts all fields from the model response', async () => {
      mockModelResponse(fullReceiptJson)
      const extractReceiptData = loadExtractReceiptData()

      const result = await extractReceiptData('test://image.jpg')

      expect(result).toMatchObject({
        companyName: 'Blue Bottle Coffee',
        address: '123 Main St',
        date: '2024-10-24',
        totalAmount: 42.5,
        taxAmount: 2.5,
        currency: 'USD',
        paymentMethod: 'Credit Card',
        paymentLast4: '4242',
        eInvoiceId: 'INV-001',
        confidence: 0.98
      })
    })

    it('applies safe defaults for missing fields', async () => {
      mockModelResponse({})
      const extractReceiptData = loadExtractReceiptData()

      const result = await extractReceiptData('test://image.jpg')

      expect(result.companyName).toBe('Unknown Merchant')
      expect(result.address).toBeNull()
      expect(result.totalAmount).toBe(0)
      expect(result.taxAmount).toBeNull()
      expect(result.currency).toBe('USD')
      expect(result.paymentMethod).toBeNull()
      expect(result.confidence).toBe(0.85)
      expect(result.eInvoiceId).toBeNull()
    })

    it('infers a valid category from the merchant name', async () => {
      mockModelResponse(fullReceiptJson)
      const extractReceiptData = loadExtractReceiptData()

      const result = await extractReceiptData('test://image.jpg')

      // "Blue Bottle Coffee" matches the "coffee" keyword
      expect(result.category).toBe('dining')
    })

    it('falls back to "other" category for unknown merchants', async () => {
      mockModelResponse({ ...fullReceiptJson, companyName: 'Mystery Shop' })
      const extractReceiptData = loadExtractReceiptData()

      const result = await extractReceiptData('test://image.jpg')

      expect(result.category).toBe('other')
    })

    it('returns confidence between 0 and 1', async () => {
      mockModelResponse(fullReceiptJson)
      const extractReceiptData = loadExtractReceiptData()

      const result = await extractReceiptData('test://image.jpg')

      expect(result.confidence).toBeGreaterThanOrEqual(0)
      expect(result.confidence).toBeLessThanOrEqual(1)
    })

    it('parses JSON wrapped in markdown fences', async () => {
      mockModelResponse(`\`\`\`json\n${JSON.stringify(fullReceiptJson)}\n\`\`\``)
      const extractReceiptData = loadExtractReceiptData()

      const result = await extractReceiptData('test://image.jpg')

      expect(result.companyName).toBe('Blue Bottle Coffee')
    })
  })

  describe('error handling', () => {
    it('throws when the response contains no JSON', async () => {
      mockModelResponse('Sorry, I could not read this receipt.')
      const extractReceiptData = loadExtractReceiptData()

      await expect(extractReceiptData('test://image.jpg')).rejects.toThrow()
    })

    it('propagates model errors', async () => {
      mockGenerateContent.mockRejectedValue(new Error('API failure'))
      const extractReceiptData = loadExtractReceiptData()

      await expect(extractReceiptData('test://image.jpg')).rejects.toThrow()
    })
  })
})
