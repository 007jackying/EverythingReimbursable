// Mock Platform as web before any imports
import { secureGet, secureSet, secureDelete } from '@/utils/secureStorage'

jest.mock('react-native', () => ({
  Platform: { OS: 'web' }
}))

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn()
}))

describe('secureStorage utility (web)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('secureGet', () => {
    it('returns value from localStorage on web', async () => {
      localStorage.setItem('test-key', 'test-value')

      const result = await secureGet('test-key')
      expect(result).toBe('test-value')
    })

    it('returns null for missing key on web', async () => {
      const result = await secureGet('missing-key')
      expect(result).toBeNull()
    })

    it('returns null when localStorage throws', async () => {
      const originalGetItem = localStorage.getItem
      localStorage.getItem = jest.fn().mockImplementation(() => {
        throw new Error('Quota exceeded')
      })

      const result = await secureGet('test-key')
      expect(result).toBeNull()

      localStorage.getItem = originalGetItem
    })
  })

  describe('secureSet', () => {
    it('sets value in localStorage on web', async () => {
      await secureSet('test-key', 'test-value')

      expect(localStorage.getItem('test-key')).toBe('test-value')
    })

    it('handles localStorage setItem errors', async () => {
      const originalSetItem = localStorage.setItem
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error('Quota exceeded')
      })

      // Should not throw
      await expect(secureSet('test-key', 'test-value')).resolves.not.toThrow()

      localStorage.setItem = originalSetItem
    })
  })

  describe('secureDelete', () => {
    it('deletes value from localStorage on web', async () => {
      localStorage.setItem('test-key', 'test-value')

      await secureDelete('test-key')

      expect(localStorage.getItem('test-key')).toBeNull()
    })
  })

  describe('error handling', () => {
    it('handles localStorage removeItem errors', async () => {
      const originalRemoveItem = localStorage.removeItem
      localStorage.removeItem = jest.fn().mockImplementation(() => {
        throw new Error('Storage error')
      })

      // Should not throw
      await expect(secureDelete('test-key')).resolves.not.toThrow()

      localStorage.removeItem = originalRemoveItem
    })
  })
})
