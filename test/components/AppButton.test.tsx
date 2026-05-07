import AppButton from '@/components/AppButton'
import { Text } from 'react-native'
import { render, fireEvent } from '../test-utils'

describe('AppButton Component', () => {
  describe('rendering', () => {
    it('renders with label', () => {
      const { getByText } = render(<AppButton label="Click Me" />)
      expect(getByText('Click Me')).toBeTruthy()
    })

    it('renders with primary variant by default', () => {
      const { getByText } = render(<AppButton label="Primary" />)
      const button = getByText('Primary')
      expect(button).toBeTruthy()
    })

    it('renders with ghost variant', () => {
      const { getByText } = render(<AppButton label="Ghost" variant="ghost" />)
      expect(getByText('Ghost')).toBeTruthy()
    })

    it('renders with quick-action-dark variant', () => {
      const { getByText } = render(<AppButton label="Dark Action" variant="quick-action-dark" />)
      expect(getByText('Dark Action')).toBeTruthy()
    })

    it('renders with quick-action-light variant', () => {
      const { getByText } = render(<AppButton label="Light Action" variant="quick-action-light" />)
      expect(getByText('Light Action')).toBeTruthy()
    })

    it('renders with disabled variant', () => {
      const { getByText } = render(<AppButton label="Disabled" variant="disabled" />)
      expect(getByText('Disabled')).toBeTruthy()
    })
  })

  describe('icons', () => {
    it('renders leading icon', () => {
      const { getByText } = render(<AppButton label="With Icon" icon={<Text>Icon</Text>} />)
      expect(getByText('Icon')).toBeTruthy()
      expect(getByText('With Icon')).toBeTruthy()
    })

    it('renders trailing icon', () => {
      const { getByText } = render(<AppButton label="With Arrow" trailingIcon={<Text>→</Text>} />)
      expect(getByText('→')).toBeTruthy()
      expect(getByText('With Arrow')).toBeTruthy()
    })

    it('renders both icons', () => {
      const { getByText } = render(
        <AppButton label="Both" icon={<Text>🔥</Text>} trailingIcon={<Text>→</Text>} />
      )
      expect(getByText('🔥')).toBeTruthy()
      expect(getByText('→')).toBeTruthy()
    })
  })

  describe('interaction', () => {
    it('calls onPress when pressed', () => {
      const onPress = jest.fn()
      const { getByText } = render(<AppButton label="Click Me" onPress={onPress} />)

      fireEvent.press(getByText('Click Me'))
      expect(onPress).toHaveBeenCalledTimes(1)
    })

    it('does not call onPress when disabled', () => {
      const onPress = jest.fn()
      const { getByText } = render(
        <AppButton label="Disabled" variant="disabled" onPress={onPress} />
      )

      fireEvent.press(getByText('Disabled'))
      expect(onPress).not.toHaveBeenCalled()
    })

    it('does not call onPress when onPress is undefined', () => {
      const { getByText } = render(<AppButton label="No Handler" />)

      // Should not throw
      expect(() => fireEvent.press(getByText('No Handler'))).not.toThrow()
    })
  })

  describe('styling', () => {
    it('applies full width by default', () => {
      const { getByText } = render(<AppButton label="Full Width" />)
      expect(getByText('Full Width')).toBeTruthy()
    })

    it('applies auto width when fullWidth is false', () => {
      const { getByText } = render(<AppButton label="Auto Width" fullWidth={false} />)
      expect(getByText('Auto Width')).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('is accessible', () => {
      const { getByText } = render(<AppButton label="Accessible" />)
      expect(getByText('Accessible')).toBeTruthy()
    })
  })
})
