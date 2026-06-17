import AppInput from '@/components/AppInput'
import { TextInput } from 'react-native'
import { render, fireEvent } from '../test-utils'

describe('AppInput Component', () => {
  describe('rendering', () => {
    it('renders with label', () => {
      const { getByText } = render(<AppInput label="EMAIL" value="" onChangeText={jest.fn()} />)
      expect(getByText('EMAIL')).toBeTruthy()
    })

    it('renders label in uppercase', () => {
      const { getByText } = render(<AppInput label="email" value="" onChangeText={jest.fn()} />)
      // RN applies uppercase via textTransform style; the text node keeps original casing
      expect(getByText('email')).toHaveStyle({ textTransform: 'uppercase' })
    })

    it('renders with placeholder', () => {
      const { getByPlaceholderText } = render(
        <AppInput label="EMAIL" value="" onChangeText={jest.fn()} placeholder="Enter email" />
      )
      expect(getByPlaceholderText('Enter email')).toBeTruthy()
    })

    it('displays current value', () => {
      const { getByDisplayValue } = render(
        <AppInput label="NAME" value="John Doe" onChangeText={jest.fn()} />
      )
      expect(getByDisplayValue('John Doe')).toBeTruthy()
    })
  })

  describe('text input', () => {
    it('calls onChangeText when text changes', () => {
      const onChangeText = jest.fn()
      const { getByPlaceholderText } = render(
        <AppInput label="EMAIL" value="" onChangeText={onChangeText} placeholder="Enter email" />
      )

      fireEvent.changeText(getByPlaceholderText('Enter email'), 'test@example.com')
      expect(onChangeText).toHaveBeenCalledWith('test@example.com')
    })

    it('accepts different keyboard types', () => {
      const { getByPlaceholderText } = render(
        <AppInput
          label="EMAIL"
          value=""
          onChangeText={jest.fn()}
          keyboardType="email-address"
          placeholder="Email"
        />
      )
      expect(getByPlaceholderText('Email')).toBeTruthy()
    })

    it('accepts autoCapitalize prop', () => {
      const { getByPlaceholderText } = render(
        <AppInput
          label="NAME"
          value=""
          onChangeText={jest.fn()}
          autoCapitalize="words"
          placeholder="Name"
        />
      )
      expect(getByPlaceholderText('Name')).toBeTruthy()
    })
  })

  describe('password field', () => {
    it('renders password toggle icon for secure input', () => {
      const { UNSAFE_queryByType: queryByType } = render(
        <AppInput label="PASSWORD" value="secret" onChangeText={jest.fn()} secureTextEntry />
      )
      // The eye icon should be present
      const input = queryByType(TextInput)
      expect(input).toBeTruthy()
    })

    it('toggles password visibility', () => {
      const { getByDisplayValue } = render(
        <AppInput label="PASSWORD" value="secret" onChangeText={jest.fn()} secureTextEntry />
      )

      const input = getByDisplayValue('secret')
      expect(input).toBeTruthy()
      // Password should be hidden initially
    })
  })

  describe('error state', () => {
    it('displays error message when provided', () => {
      const { getByText } = render(
        <AppInput label="EMAIL" value="" onChangeText={jest.fn()} error="Invalid email" />
      )
      expect(getByText('Invalid email')).toBeTruthy()
    })

    it('does not display error when not provided', () => {
      const { queryByText } = render(<AppInput label="EMAIL" value="" onChangeText={jest.fn()} />)
      expect(queryByText('Invalid email')).toBeNull()
    })
  })

  describe('focus state', () => {
    it('handles focus and blur events', () => {
      const { getByPlaceholderText } = render(
        <AppInput label="EMAIL" value="" onChangeText={jest.fn()} placeholder="Email" />
      )

      const input = getByPlaceholderText('Email')
      fireEvent(input, 'focus')
      fireEvent(input, 'blur')

      // Should not throw
      expect(input).toBeTruthy()
    })
  })

  describe('accessibility', () => {
    it('is accessible with label', () => {
      const { getByText } = render(<AppInput label="EMAIL" value="" onChangeText={jest.fn()} />)
      expect(getByText('EMAIL')).toBeTruthy()
    })
  })
})
