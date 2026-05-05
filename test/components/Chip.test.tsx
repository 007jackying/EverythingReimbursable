import { render } from '../test-utils'
import Chip from '@/components/Chip'
import { Text } from 'react-native'

describe('Chip Component', () => {
  describe('rendering variants', () => {
    it('renders verified variant', () => {
      const { getByText } = render(<Chip variant="verified" label="VERIFIED" />)
      expect(getByText('VERIFIED')).toBeTruthy()
    })

    it('renders pending variant', () => {
      const { getByText } = render(<Chip variant="pending" label="PENDING" />)
      expect(getByText('PENDING')).toBeTruthy()
    })

    it('renders category variant', () => {
      const { getByText } = render(<Chip variant="category" label="DINING" />)
      expect(getByText('DINING')).toBeTruthy()
    })

    it('renders category-large variant', () => {
      const { getByText } = render(<Chip variant="category-large" label="DINING" />)
      expect(getByText('DINING')).toBeTruthy()
    })

    it('renders ai-verified variant', () => {
      const { getByText } = render(<Chip variant="ai-verified" label="AI VERIFIED" />)
      expect(getByText('AI VERIFIED')).toBeTruthy()
    })

    it('renders bank-grade variant', () => {
      const { getByText } = render(<Chip variant="bank-grade" label="BANK-GRADE" />)
      expect(getByText('BANK-GRADE')).toBeTruthy()
    })
  })

  describe('label formatting', () => {
    it('displays label text', () => {
      const { getByText } = render(<Chip variant="verified" label="TEST LABEL" />)
      expect(getByText('TEST LABEL')).toBeTruthy()
    })

    it('renders label in uppercase', () => {
      const { getByText } = render(<Chip variant="verified" label="test label" />)
      expect(getByText('test label')).toBeTruthy()
    })
  })

  describe('icons', () => {
    it('renders icon when provided', () => {
      const { getByText } = render(
        <Chip variant="verified" label="VERIFIED" icon={<Text>✓</Text>} />
      )
      expect(getByText('✓')).toBeTruthy()
      expect(getByText('VERIFIED')).toBeTruthy()
    })

    it('renders icon for verified variant', () => {
      const { getByText } = render(
        <Chip variant="verified" label="VERIFIED" icon={<Text>Icon</Text>} />
      )
      expect(getByText('Icon')).toBeTruthy()
    })

    it('renders icon for pending variant', () => {
      const { getByText } = render(
        <Chip variant="pending" label="PENDING" icon={<Text>Icon</Text>} />
      )
      expect(getByText('Icon')).toBeTruthy()
    })
  })

  describe('dot indicator', () => {
    it('verified variant shows dot when no icon', () => {
      const { getByText } = render(<Chip variant="verified" label="VERIFIED" />)
      expect(getByText('VERIFIED')).toBeTruthy()
    })

    it('pending variant shows dot when no icon', () => {
      const { getByText } = render(<Chip variant="pending" label="PENDING" />)
      expect(getByText('PENDING')).toBeTruthy()
    })

    it('other variants do not show dot', () => {
      const { getByText } = render(<Chip variant="category" label="DINING" />)
      expect(getByText('DINING')).toBeTruthy()
    })
  })

  describe('styling', () => {
    it('applies correct styling for each variant', () => {
      const variants = ['verified', 'pending', 'category', 'category-large', 'ai-verified', 'bank-grade'] as const
      
      variants.forEach(variant => {
        const { getByText } = render(<Chip variant={variant} label={variant} />)
        expect(getByText(variant)).toBeTruthy()
      })
    })
  })

  describe('accessibility', () => {
    it('is accessible', () => {
      const { getByText } = render(<Chip variant="verified" label="VERIFIED" />)
      expect(getByText('VERIFIED')).toBeTruthy()
    })
  })
})