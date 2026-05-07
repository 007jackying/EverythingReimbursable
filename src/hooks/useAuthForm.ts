import { useState, useCallback } from 'react'
import { validateEmail, validatePassword, validateName } from '@/utils/validators'

interface AuthFormState {
  email: string
  password: string
  name: string
  emailError: string
  passwordError: string
  nameError: string
}

interface UseAuthFormReturn {
  email: string
  password: string
  name: string
  emailError: string
  passwordError: string
  nameError: string
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  setName: (name: string) => void
  clearErrors: () => void
  validateLoginForm: () => boolean
  validateSignUpForm: () => boolean
}

export const useAuthForm = (initialState?: Partial<AuthFormState>): UseAuthFormReturn => {
  const [email, setEmail] = useState(initialState?.email ?? '')
  const [password, setPassword] = useState(initialState?.password ?? '')
  const [name, setName] = useState(initialState?.name ?? '')
  const [emailError, setEmailError] = useState(initialState?.emailError ?? '')
  const [passwordError, setPasswordError] = useState(initialState?.passwordError ?? '')
  const [nameError, setNameError] = useState(initialState?.nameError ?? '')

  const clearErrors = useCallback(() => {
    setEmailError('')
    setPasswordError('')
    setNameError('')
  }, [])

  const validateLoginForm = useCallback(() => {
    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)

    setEmailError(emailErr || '')
    setPasswordError(passErr || '')

    return !emailErr && !passErr
  }, [email, password])

  const validateSignUpForm = useCallback(() => {
    const nameErr = validateName(name)
    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)

    setNameError(nameErr || '')
    setEmailError(emailErr || '')
    setPasswordError(passErr || '')

    return !nameErr && !emailErr && !passErr
  }, [name, email, password])

  return {
    email,
    password,
    name,
    emailError,
    passwordError,
    nameError,
    setEmail,
    setPassword,
    setName,
    clearErrors,
    validateLoginForm,
    validateSignUpForm
  }
}
