'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import { useAuth } from '@/lib/auth'
import { validateEmail, validateName, validatePassword } from '@/lib/format'
import { APP_NAME } from '@/lib/types'

const SignUpPage = () => {
  const router = useRouter()
  const { signUp, isAuthenticated, isLoading } = useAuth()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAuthenticated && !isLoading) router.replace('/home')
  }, [isAuthenticated, isLoading, router])

  if (isLoading || isAuthenticated) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreeTerms) return
    const nameErr = validateName(fullName)
    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)
    setNameError(nameErr)
    setEmailError(emailErr)
    setPasswordError(passErr)
    setAuthError(null)
    if (nameErr || emailErr || passErr) return

    setIsSubmitting(true)
    try {
      await signUp(fullName, email, password)
      router.replace('/home')
    } catch (err) {
      setAuthError((err as Error).message)
      setIsSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-8 pt-12">
      {/* Branding */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Icon name="receipt_long" size={24} className="text-on-primary" />
        </div>
        <span className="font-headline text-base font-bold tracking-tight text-primary">
          {APP_NAME}
        </span>
      </div>

      <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-primary">
        Create Account
      </h1>
      <p className="mb-8 font-body text-[15px] text-on-surface-variant">
        Start curating your digital archives today.
      </p>

      {authError && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2 rounded-xl bg-error-container px-4 py-3"
        >
          <Icon name="error" size={20} className="text-error" />
          <p className="font-body text-sm font-medium text-error">{authError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <Input
          label="FULL NAME"
          type="text"
          value={fullName}
          onChange={(v: string) => {
            setFullName(v)
            setNameError(null)
          }}
          placeholder="Your full name"
          error={nameError}
          autoComplete="name"
        />
        <Input
          label="EMAIL ADDRESS"
          type="email"
          value={email}
          onChange={(v: string) => {
            setEmail(v)
            setEmailError(null)
          }}
          placeholder="you@example.com"
          error={emailError}
          autoComplete="email"
        />
        <Input
          label="PASSWORD"
          type="password"
          value={password}
          onChange={(v: string) => {
            setPassword(v)
            setPasswordError(null)
          }}
          placeholder="Create a password (min. 6 chars)"
          error={passwordError}
          autoComplete="new-password"
        />

        {/* Terms checkbox */}
        <label className="flex cursor-pointer items-start gap-3 px-1 py-1">
          <input
            type="checkbox"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-outline-variant accent-secondary"
          />
          <span className="font-body text-[13px] leading-tight text-on-surface-variant">
            I agree to the{' '}
            <span className="font-bold text-primary underline underline-offset-4">
              Terms of Service
            </span>{' '}
            and{' '}
            <span className="font-bold text-primary underline underline-offset-4">
              Privacy Policy
            </span>
          </span>
        </label>

        <Button type="submit" disabled={!agreeTerms} loading={isSubmitting} arrow>
          Create Account
        </Button>
      </form>

      <p className="mt-auto flex items-center justify-center pt-12 text-center font-body text-sm text-on-surface-variant">
        Already part of the collection?{' '}
        <Link
          href="/login"
          className="ml-1 font-headline font-bold text-primary underline underline-offset-4 decoration-secondary/30 transition-colors hover:text-secondary"
        >
          Sign In
        </Link>
      </p>
    </main>
  )
}

export default SignUpPage
