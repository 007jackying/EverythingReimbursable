'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { useAuth } from '@/lib/auth'
import { useReceipts } from '@/lib/receipts'
import { useCurrency, CURRENCY_OPTIONS } from '@/lib/currency'
import { exportReceiptsCsv } from '@/lib/csv'

/* Bottom-sheet-style modal: backdrop + white rounded-2xl panel, slide-up ≤300ms.
   Closes on backdrop click and Escape. */
const Sheet = ({
  label,
  onClose,
  children
}: {
  label: string
  onClose: () => void
  children: React.ReactNode
}) => {
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true))
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-[rgba(26,28,27,0.4)]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={`relative w-full max-w-[640px] rounded-t-2xl bg-surface-container-lowest px-6 pb-10 pt-3 transition-transform duration-300 ease-out ${
          shown ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="mx-auto mb-6 h-1 w-9 rounded-full bg-outline-variant" />
        {children}
      </div>
    </div>
  )
}

const SettingsRow = ({
  icon,
  label,
  description,
  trailing,
  onClick
}: {
  icon: string
  label: string
  description: string
  trailing?: React.ReactNode
  onClick: () => void
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full items-center gap-4 rounded-2xl bg-surface-container-lowest p-4 text-left shadow-editorial transition-colors hover:bg-surface-container-high"
  >
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-primary-container">
      <Icon name={icon} size={24} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-headline text-[15px] font-bold text-primary">{label}</p>
      <p className="truncate font-body text-[13px] text-on-surface-variant">{description}</p>
    </div>
    {trailing}
    <Icon name="chevron_right" size={24} className="text-outline" />
  </button>
)

const ProfilePage = () => {
  const router = useRouter()
  const { user, logout, updateName } = useAuth()
  const { receipts } = useReceipts()
  const { currency, setCurrency } = useCurrency()

  const [editNameOpen, setEditNameOpen] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [currencyOpen, setCurrencyOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [rowFeedback, setRowFeedback] = useState<{ key: string; text: string } | null>(null)
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    },
    []
  )

  const flashFeedback = (key: string, text: string) => {
    if (feedbackTimer.current) clearTimeout(feedbackTimer.current)
    setRowFeedback({ key, text })
    feedbackTimer.current = setTimeout(() => setRowFeedback(null), 2000)
  }

  const initial = (user?.name?.trim().charAt(0) || 'U').toUpperCase()

  const confidenceLabel = useMemo(() => {
    if (receipts.length === 0) return '—'
    const avg = receipts.reduce((sum, r) => sum + r.confidence, 0) / receipts.length
    return `${(avg * 100).toFixed(1)}%`
  }, [receipts])

  const openEditName = () => {
    setDraftName(user?.name ?? '')
    setEditNameOpen(true)
  }

  const handleSaveName = async () => {
    const trimmed = draftName.trim()
    if (!trimmed || savingName) return
    setSavingName(true)
    try {
      await updateName(trimmed)
      setEditNameOpen(false)
    } finally {
      setSavingName(false)
    }
  }

  const handleSelectCurrency = (code: string) => {
    setCurrency(code)
    setCurrencyOpen(false)
  }

  const handleExport = () => {
    exportReceiptsCsv(receipts)
    flashFeedback('export', 'Exported')
  }

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
      router.replace('/login')
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="min-h-dvh bg-background">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-background px-6 py-4">
        <h1 className="font-headline text-xl font-bold tracking-tighter text-primary">
          EverythingReimbursable
        </h1>
        <div
          aria-hidden
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container font-label text-sm font-bold text-on-primary"
        >
          {initial}
        </div>
      </header>

      <main className="px-6">
        {/* Identity block */}
        <section className="mb-10 mt-6 flex flex-col items-center text-center">
          <div className="relative mb-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-primary-container shadow-editorial">
              <span className="font-label text-4xl font-bold text-on-primary">{initial}</span>
            </div>
            <div className="absolute -bottom-2 -right-2 rounded-xl bg-secondary p-2 text-on-secondary shadow-lg">
              <Icon name="verified" filled size={14} />
            </div>
          </div>

          <button
            type="button"
            onClick={openEditName}
            aria-label="Edit display name"
            className="flex items-center gap-2"
          >
            <span className="font-headline text-2xl font-extrabold tracking-tight text-primary">
              {user?.name ?? 'Guest'}
            </span>
            <Icon name="edit" size={16} className="text-on-surface-variant" />
          </button>
          <p className="mt-1 font-body text-sm text-on-surface-variant">{user?.email ?? ''}</p>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-secondary-container/30 px-4 py-1.5">
            <Icon name="stars" filled size={16} className="text-secondary" />
            <span className="font-label text-xs font-bold uppercase tracking-widest text-secondary">
              Premium Member
            </span>
          </div>
        </section>

        {/* Stats row */}
        <section className="mb-10 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-surface-container-lowest p-5 shadow-editorial">
            <p className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Receipts Scanned
            </p>
            <p className="mt-2 font-headline text-[30px] font-bold leading-none text-primary">
              {receipts.length}
            </p>
          </div>
          <div className="rounded-2xl bg-primary-container p-5">
            <p className="font-label text-[10px] font-bold uppercase tracking-widest text-on-primary-container">
              Confidence
            </p>
            <p className="mt-2 font-label text-[30px] font-bold leading-none text-on-primary">
              {confidenceLabel}
            </p>
          </div>
        </section>

        {/* Settings */}
        <section className="space-y-3">
          <h2 className="ml-2 font-label text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
            Preferences &amp; Security
          </h2>

          <SettingsRow
            icon="notifications"
            label="Notifications"
            description={
              rowFeedback?.key === 'notifications' ? rowFeedback.text : 'Push & email alerts'
            }
            onClick={() => flashFeedback('notifications', 'Coming soon')}
          />

          <SettingsRow
            icon="attach_money"
            label="Currency"
            description={CURRENCY_OPTIONS[currency] ?? currency}
            trailing={
              <span className="shrink-0 rounded-lg bg-primary-container px-3 py-1 font-label text-[13px] font-bold text-on-primary">
                {currency}
              </span>
            }
            onClick={() => setCurrencyOpen(true)}
          />

          <SettingsRow
            icon="ios_share"
            label="Export Data"
            description={
              rowFeedback?.key === 'export' ? rowFeedback.text : 'CSV report of all receipts'
            }
            onClick={handleExport}
          />

          <SettingsRow
            icon="settings"
            label="General Settings"
            description={rowFeedback?.key === 'general' ? rowFeedback.text : 'App preferences'}
            onClick={() => flashFeedback('general', 'Coming soon')}
          />

          {/* Logout — neutral style, not red */}
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-4 rounded-2xl bg-surface-container-low p-4 text-left transition-colors hover:bg-surface-container-high disabled:opacity-60"
          >
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-on-surface-variant">
              <Icon name="logout" size={24} />
            </div>
            <span className="font-headline text-[15px] font-bold text-on-surface-variant">
              {loggingOut ? 'Logging out…' : 'Logout Account'}
            </span>
          </button>
        </section>

        {/* Help row */}
        <section className="mt-10 border-t border-outline-variant/20 px-1 py-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-headline text-[15px] font-bold text-primary">Need Help?</h3>
              <p className="font-body text-[13px] text-on-surface-variant">
                Our support team is here 24/7
              </p>
            </div>
            <a
              href="mailto:support@everythingreimbursable.app"
              className="rounded-xl bg-primary px-6 py-3 font-label text-sm font-bold text-on-primary transition-transform duration-200 active:scale-95"
            >
              Contact
            </a>
          </div>
        </section>
      </main>

      {/* Edit name modal */}
      {editNameOpen && (
        <Sheet label="Edit display name" onClose={() => setEditNameOpen(false)}>
          <h2 className="mb-6 font-headline text-xl font-bold text-primary">Edit Display Name</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSaveName()
            }}
            className="space-y-6"
          >
            <Input label="Name" value={draftName} onChange={setDraftName} placeholder="Your name" />
            <div className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                arrow
                loading={savingName}
                disabled={!draftName.trim()}
              >
                Save Name
              </Button>
              <Button variant="ghost" onClick={() => setEditNameOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Sheet>
      )}

      {/* Currency picker sheet */}
      {currencyOpen && (
        <Sheet label="Select currency" onClose={() => setCurrencyOpen(false)}>
          <h2 className="mb-2 font-headline text-xl font-bold text-primary">Select Currency</h2>
          <p className="mb-6 font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
            Currency
          </p>
          <div className="space-y-2">
            {Object.entries(CURRENCY_OPTIONS).map(([code, name]) => {
              const active = code === currency
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelectCurrency(code)}
                  aria-pressed={active}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-colors ${
                    active
                      ? 'bg-primary-container'
                      : 'bg-surface-container-low hover:bg-surface-container-high'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-10 font-label text-[15px] font-bold ${
                        active ? 'text-on-primary' : 'text-primary'
                      }`}
                    >
                      {code}
                    </span>
                    <span
                      className={`font-body text-[13px] ${
                        active ? 'text-on-primary-container' : 'text-on-surface-variant'
                      }`}
                    >
                      {name}
                    </span>
                  </div>
                  {active && <Icon name="check" size={18} className="text-on-primary" />}
                </button>
              )
            })}
          </div>
        </Sheet>
      )}
    </div>
  )
}

export default ProfilePage
