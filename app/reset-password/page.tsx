'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import Input from '@/components/Input'
import { useAuth } from '@/lib/auth'
import { validateEmail, validatePassword } from '@/lib/format'
import { APP_NAME } from '@/lib/types'

type Mode = 'request' | 'recovery'

const ResetPasswordPage = () => {
  const { resetPassword, updatePassword } = useAuth()

  const [mode, setMode] = useState<Mode>('request')

  // Request mode state
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string | null>(null)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sentTo, setSentTo] = useState<string | null>(null)

  // Recovery mode state
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)

  useEffect(() => {
    // Supabase recovery emails land here with tokens in the URL fragment:
    // /reset-password#access_token=...&refresh_token=...&type=recovery
    // supabase-js consumes the hash and establishes a session automatically.
    if (window.location.hash.includes('type=recovery')) setMode('recovery')
  }, [])

  const handleSendReset = async (e: React.FormEvent) => {
    e.preventDefault()
    const emailErr = validateEmail(email)
    setEmailError(emailErr)
    setRequestError(null)
    if (emailErr) return

    setIsSending(true)
    try {
      await resetPassword(email)
      setSentTo(email)
    } catch (err) {
      setRequestError((err as Error).message)
    } finally {
      setIsSending(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const passErr = validatePassword(newPassword)
    const matchErr = newPassword !== confirmPassword ? 'Passwords do not match' : null
    setPasswordError(passErr)
    setConfirmError(matchErr)
    setUpdateError(null)
    if (passErr || matchErr) return

    setIsSaving(true)
    try {
      await updatePassword(newPassword)
      setIsUpdated(true)
    } catch (err) {
      setUpdateError((err as Error).message)
    } finally {
      setIsSaving(false)
    }
  }

  const inlineError = mode === 'request' ? requestError : updateError

  return (
    <main className="flex min-h-dvh flex-col px-6 pb-8 pt-12">
      {/* Branding */}
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Icon name="lock_reset" size={24} className="text-on-primary" />
        </div>
        <span className="font-headline text-base font-bold tracking-tight text-primary">
          {APP_NAME}
        </span>
      </div>

      {inlineError && (
        <div
          role="alert"
          className="mb-6 flex items-center gap-2 rounded-xl bg-error-container px-4 py-3"
        >
          <Icon name="error" size={20} className="text-error" />
          <p className="font-body text-sm font-medium text-error">{inlineError}</p>
        </div>
      )}

      {mode === 'request' ? (
        sentTo ? (
          <div className="flex flex-col items-start gap-3">
            <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
              <Icon name="mark_email_read" size={28} className="text-secondary" />
            </div>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary">
              Check your email.
            </h1>
            <p className="mb-6 font-body text-[15px] text-on-surface-variant">
              If an account exists for <span className="font-bold text-primary">{sentTo}</span>, a
              password reset link is on its way.
            </p>
            <Link
              href="/login"
              className="font-headline text-sm font-bold text-secondary underline-offset-4 hover:underline"
            >
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-primary">
              Reset password.
            </h1>
            <p className="mb-8 font-body text-[15px] text-on-surface-variant">
              Enter your email and we will send you a reset link.
            </p>
            <form onSubmit={handleSendReset} noValidate className="flex flex-col gap-6">
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
              <Button type="submit" loading={isSending} arrow>
                Send Reset Link
              </Button>
            </form>
          </>
        )
      ) : isUpdated ? (
        <div className="flex flex-col items-start gap-3">
          <div className="mb-1 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
            <Icon name="check_circle" size={28} filled className="text-secondary" />
          </div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary">
            Password updated.
          </h1>
          <p className="mb-6 font-body text-[15px] text-on-surface-variant">
            Your password has been changed. You can now sign in with your new password.
          </p>
          <Link
            href="/login"
            className="font-headline text-sm font-bold text-secondary underline-offset-4 hover:underline"
          >
            Continue to Sign In
          </Link>
        </div>
      ) : (
        <>
          <h1 className="mb-2 font-headline text-4xl font-extrabold tracking-tight text-primary">
            New password.
          </h1>
          <p className="mb-8 font-body text-[15px] text-on-surface-variant">
            Choose a new password for your account.
          </p>
          <form onSubmit={handleUpdatePassword} noValidate className="flex flex-col gap-6">
            <Input
              label="NEW PASSWORD"
              type="password"
              value={newPassword}
              onChange={(v: string) => {
                setNewPassword(v)
                setPasswordError(null)
              }}
              placeholder="Enter new password"
              error={passwordError}
              autoComplete="new-password"
            />
            <Input
              label="CONFIRM PASSWORD"
              type="password"
              value={confirmPassword}
              onChange={(v: string) => {
                setConfirmPassword(v)
                setConfirmError(null)
              }}
              placeholder="Repeat new password"
              error={confirmError}
              autoComplete="new-password"
            />
            <Button type="submit" loading={isSaving} arrow>
              Save Password
            </Button>
          </form>
        </>
      )}

      <p className="mt-auto flex items-center justify-center pt-12 text-center font-body text-sm text-on-surface-variant">
        Remembered it?{' '}
        <Link
          href="/login"
          className="ml-1 font-headline font-bold text-primary underline-offset-4 hover:underline"
        >
          Sign In
        </Link>
      </p>
    </main>
  )
}

export default ResetPasswordPage
