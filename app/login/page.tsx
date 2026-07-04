'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import { useAuth } from '@/lib/auth'
import { validateEmail, validatePassword } from '@/lib/format'
import { APP_NAME } from '@/lib/types'

const LoginPage = () => {
  const router = useRouter()
  const { login, isAuthenticated, isLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
    const emailErr = validateEmail(email)
    const passErr = validatePassword(password)
    setEmailError(emailErr)
    setPasswordError(passErr)
    setAuthError(null)
    if (emailErr || passErr) return

    setIsSubmitting(true)
    try {
      await login(email, password)
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
        Welcome back.
      </h1>
      <p className="mb-8 font-body text-[15px] text-on-surface-variant">
        Step back into your curated financial world.
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
          placeholder="Enter your password"
          error={passwordError}
          autoComplete="current-password"
          trailing={
            <Link
              href="/reset-password"
              className="font-label text-xs font-bold text-secondary underline-offset-4 hover:underline"
            >
              Forgot?
            </Link>
          }
        />
        <Button type="submit" loading={isSubmitting} arrow>
          Continue
        </Button>
      </form>

      <p className="mt-auto flex items-center justify-center pt-12 text-center font-body text-sm text-on-surface-variant">
        New to the Lens?{' '}
        <Link
          href="/signup"
          className="ml-1 font-headline font-bold text-primary underline-offset-4 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </main>
  )
}

export default LoginPage
