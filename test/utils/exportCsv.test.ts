import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { createMockReceipt } from '../test-utils'

// Mock the modules
jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Paths: {
    cache: 'cache',
    documents: 'documents'
  }
}))

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn()
}))

// Import after mocking
const { exportReceiptsCsv } = require('@/utils/exportCsv')

describe('exportCsv utility', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('CSV generation', () => {
    it('generates CSV with headers only for empty array', async () => {
      const mockWrite = jest.fn()
      const mockFile = { write: mockWrite, uri: 'test.csv' }
      ;(FileSystem.File as unknown as jest.Mock).mockImplementation(() => mockFile)
      ;(Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true)
      ;(Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined)

      await exportReceiptsCsv([])

      expect(mockWrite).toHaveBeenCalled()
      const csvContent = mockWrite.mock.calls[0][0]
      expect(csvContent).toContain('ID')
      expect(csvContent).toContain('Date')
      expect(csvContent).toContain('Merchant')
      expect(csvContent).toContain('Total Amount')
    })

    it('generates CSV with one receipt', async () => {
      const mockWrite = jest.fn()
      const mockFile = { write: mockWrite, uri: 'test.csv' }
      ;(FileSystem.File as unknown as jest.Mock).mockImplementation(() => mockFile)
      ;(Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true)

      const receipt = createMockReceipt()
      await exportReceiptsCsv([receipt])

      const csvContent = mockWrite.mock.calls[0][0]
      expect(csvContent).toContain('Test Merchant')
      expect(csvContent).toContain('100.00')
      expect(csvContent).toContain('USD')
    })

    it('generates CSV with multiple receipts', async () => {
      const mockWrite = jest.fn()
      const mockFile = { write: mockWrite, uri: 'test.csv' }
      ;(FileSystem.File as unknown as jest.Mock).mockImplementation(() => mockFile)
      ;(Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true)

      const receipts = [
        createMockReceipt({ id: '1', companyName: 'Merchant 1' }),
        createMockReceipt({ id: '2', companyName: 'Merchant 2' }),
        createMockReceipt({ id: '3', companyName: 'Merchant 3' })
      ]
      await exportReceiptsCsv(receipts)

      const csvContent = mockWrite.mock.calls[0][0]
      expect(csvContent).toContain('Merchant 1')
      expect(csvContent).toContain('Merchant 2')
      expect(csvContent).toContain('Merchant 3')
    })

    it('handles receipts with null fields', async () => {
      const mockWrite = jest.fn()
      const mockFile = { write: mockWrite, uri: 'test.csv' }
      ;(FileSystem.File as unknown as jest.Mock).mockImplementation(() => mockFile)
      ;(Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true)

      const receipt = createMockReceipt({
        address: null,
        taxAmount: null,
        paymentMethod: null,
        notes: null
      })
      await exportReceiptsCsv([receipt])

      expect(mockWrite).toHaveBeenCalled()
    })

    it('escapes special characters in CSV', async () => {
      const mockWrite = jest.fn()
      const mockFile = { write: mockWrite, uri: 'test.csv' }
      ;(FileSystem.File as unknown as jest.Mock).mockImplementation(() => mockFile)
      ;(Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true)

      const receipt = createMockReceipt({
        companyName: 'Merchant, Inc.',
        address: '123 "Main" St'
      })
      await exportReceiptsCsv([receipt])

      const csvContent = mockWrite.mock.calls[0][0]
      expect(csvContent).toContain('"Merchant, Inc."')
    })
  })

  describe('error handling', () => {
    it('throws error when sharing is not available', async () => {
      ;(Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(false)

      await expect(exportReceiptsCsv([])).rejects.toThrow('Sharing is not available')
    })

    it('calls share with correct parameters', async () => {
      const mockWrite = jest.fn()
      const mockFile = { write: mockWrite, uri: 'test.csv' }
      ;(FileSystem.File as unknown as jest.Mock).mockImplementation(() => mockFile)
      ;(Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true)
      ;(Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined)

      await exportReceiptsCsv([createMockReceipt()])

      expect(Sharing.shareAsync).toHaveBeenCalledWith(
        'test.csv',
        expect.objectContaining({
          mimeType: 'text/csv',
          dialogTitle: 'Export Receipts'
        })
      )
    })
  })

  describe('filename generation', () => {
    it('generates filename with current date', async () => {
      const mockWrite = jest.fn()
      const mockFile = { write: mockWrite, uri: 'test.csv' }
      ;(FileSystem.File as unknown as jest.Mock).mockImplementation(() => mockFile)
      ;(Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true)

      const today = new Date().toISOString().split('T')[0]
      await exportReceiptsCsv([])

      expect(FileSystem.File).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining(today)
      )
    })
  })
})