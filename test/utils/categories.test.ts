import { getCategoryIcon, categoryIconMap } from '@/utils/categories'
import type { ReceiptCategory } from '@/types/receipt'

describe('categories utility', () => {
  describe('getCategoryIcon', () => {
    it('returns correct icon for dining category', () => {
      expect(getCategoryIcon('dining')).toBe('restaurant')
    })

    it('returns correct icon for grocery category', () => {
      expect(getCategoryIcon('grocery')).toBe('local-grocery-store')
    })

    it('returns correct icon for electronics category', () => {
      expect(getCategoryIcon('electronics')).toBe('devices')
    })

    it('returns correct icon for travel category', () => {
      expect(getCategoryIcon('travel')).toBe('flight')
    })

    it('returns correct icon for transport category', () => {
      expect(getCategoryIcon('transport')).toBe('directions-car')
    })

    it('returns correct icon for healthcare category', () => {
      expect(getCategoryIcon('healthcare')).toBe('local-hospital')
    })

    it('returns correct icon for utilities category', () => {
      expect(getCategoryIcon('utilities')).toBe('bolt')
    })

    it('returns correct icon for other category', () => {
      expect(getCategoryIcon('other')).toBe('receipt')
    })
  })

  describe('categoryIconMap', () => {
    it('contains all required categories', () => {
      const expectedCategories: ReceiptCategory[] = [
        'dining',
        'grocery',
        'electronics',
        'travel',
        'transport',
        'healthcare',
        'utilities',
        'other'
      ]

      expectedCategories.forEach((category) => {
        expect(categoryIconMap[category]).toBeDefined()
      })
    })

    it('has exactly 8 categories', () => {
      const keys = Object.keys(categoryIconMap)
      expect(keys.length).toBe(8)
    })

    it('all icons are non-empty strings', () => {
      Object.values(categoryIconMap).forEach((icon) => {
        expect(icon).toBeTruthy()
        expect(typeof icon).toBe('string')
      })
    })
  })
})
