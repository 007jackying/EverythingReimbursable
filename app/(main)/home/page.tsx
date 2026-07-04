'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import Button from '@/components/Button'
import { useAuth } from '@/lib/auth'
import { useReceipts } from '@/lib/receipts'
import { useCurrency } from '@/lib/currency'
import { formatAmount, formatDate, getGreeting, isCurrentMonth } from '@/lib/format'
import { getCategoryIcon } from '@/lib/categories'
import { APP_NAME, CATEGORY_LABELS, RECENT_RECEIPTS_LIMIT } from '@/lib/types'
import type { Receipt } from '@/lib/types'

const listEnterStyle = `
@keyframes home-list-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.home-list-enter { animation: home-list-enter 240ms ease-out both; }
`

const StatusIndicator = ({ status }: { status: Receipt['status'] }) => {
  if (status === 'verified') {
    return (
      <div className="mt-1 flex items-center justify-end gap-1">
        <Icon name="verified" filled size={14} className="text-secondary" />
        <span className="font-label text-[10px] font-bold uppercase tracking-tight text-secondary">
          Verified
        </span>
      </div>
    )
  }
  if (status === 'pending') {
    return (
      <div className="mt-1 flex items-center justify-end gap-1">
        <Icon name="schedule" size={14} className="text-outline" />
        <span className="font-label text-[10px] font-bold uppercase tracking-tight text-outline">
          Pending
        </span>
      </div>
    )
  }
  return (
    <div className="mt-1 flex items-center justify-end gap-1">
      <Icon name="error" size={14} className="text-error" />
      <span className="font-label text-[10px] font-bold uppercase tracking-tight text-error">
        Failed
      </span>
    </div>
  )
}

const ReceiptCard = ({ receipt, index }: { receipt: Receipt; index: number }) => (
  <Link
    href={`/review?id=${receipt.id}`}
    className="home-list-enter flex items-center justify-between rounded-3xl bg-surface-container-lowest p-5 shadow-editorial transition-shadow hover:shadow-md"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    <div className="flex min-w-0 items-center gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-container-low text-primary">
        <Icon name={getCategoryIcon(receipt.category)} size={24} />
      </div>
      <div className="min-w-0">
        <p className="truncate font-bold text-primary">{receipt.companyName}</p>
        <p className="font-label text-xs text-on-surface-variant">{formatDate(receipt.date)}</p>
        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-secondary-container/30 px-3 py-1 font-label text-[10px] font-bold uppercase tracking-wider text-on-secondary-container">
            {CATEGORY_LABELS[receipt.category]}
          </span>
        </div>
      </div>
    </div>
    <div className="shrink-0 text-right">
      <p className="font-label text-lg font-bold text-primary">
        {formatAmount(receipt.totalAmount, receipt.currency)}
      </p>
      <StatusIndicator status={receipt.status} />
    </div>
  </Link>
)

const HomePage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { receipts } = useReceipts()
  const { currency } = useCurrency()

  const {
    monthlyTotal,
    monthlyCount,
    totalExpenses,
    avgConfidence,
    hasMixedCurrencies,
    displayCurrency
  } = useMemo(() => {
    const monthlyReceipts = receipts.filter((r) => isCurrentMonth(r.date))
    // Sums are nominal — no FX conversion. With a single receipt currency, totals
    // display in it; with mixed currencies, the preferred currency + a note.
    const distinctCurrencies = [...new Set(receipts.map((r) => r.currency))]
    return {
      monthlyTotal: monthlyReceipts.reduce((sum, r) => sum + r.totalAmount, 0),
      monthlyCount: monthlyReceipts.length,
      totalExpenses: receipts.reduce((sum, r) => sum + r.totalAmount, 0),
      avgConfidence:
        receipts.length > 0
          ? receipts.reduce((sum, r) => sum + r.confidence, 0) / receipts.length
          : null,
      hasMixedCurrencies: distinctCurrencies.length > 1,
      displayCurrency: distinctCurrencies.length === 1 ? distinctCurrencies[0] : currency
    }
  }, [receipts, currency])

  const recentReceipts = useMemo(
    () =>
      [...receipts]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, RECENT_RECEIPTS_LIMIT),
    [receipts]
  )
  const hasMore = receipts.length > RECENT_RECEIPTS_LIMIT

  const firstName = user?.name?.split(' ')[0] ?? 'there'
  const initial = (user?.name?.trim().charAt(0) ?? 'U').toUpperCase()

  return (
    <div className="min-h-dvh bg-background">
      <style>{listEnterStyle}</style>

      {/* Sticky header */}
      <header className="sticky top-0 z-40 flex w-full items-center justify-between bg-background px-6 py-4">
        <h1 className="font-headline text-xl font-bold tracking-tighter text-primary">
          {APP_NAME}
        </h1>
        <div
          aria-label={`Signed in as ${user?.name ?? 'user'}`}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-container font-label text-sm font-bold text-on-primary"
        >
          {initial}
        </div>
      </header>

      <main className="px-6 pt-2 pb-10">
        {/* Greeting */}
        <section className="mb-8">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-primary">
            {getGreeting()}, {firstName}
          </h2>
          <p className="mt-1 font-medium text-on-surface-variant">
            Ready to organize your finances?
          </p>
        </section>

        {/* Summary card */}
        <section className="relative mb-8 overflow-hidden rounded-[2rem] bg-primary-container p-8 text-on-primary shadow-hero">
          <div
            aria-hidden
            className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-secondary/10 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl"
          />
          <div className="relative z-10 flex flex-col gap-6">
            <div>
              <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-primary-container">
                Total Expenses
              </p>
              <h3 className="font-label text-4xl font-extrabold tracking-tight">
                {formatAmount(totalExpenses, displayCurrency)}
              </h3>
              {hasMixedCurrencies && (
                <p className="mt-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-primary-container">
                  Includes mixed currencies
                </p>
              )}
            </div>

            {/* Monthly stats bento */}
            <div className="flex rounded-2xl bg-on-primary/10 p-4 backdrop-blur-md">
              <div className="flex-1">
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-on-primary-container">
                  This Month
                </p>
                <p className="mt-1 truncate font-label text-xl font-bold">
                  {formatAmount(monthlyTotal, displayCurrency)}
                </p>
                <p className="text-[10px] opacity-60">{monthlyCount} receipts</p>
              </div>
              <div aria-hidden className="mx-4 w-px self-stretch bg-on-primary/10" />
              <div className="flex-1">
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-on-primary-container">
                  All Time
                </p>
                <p className="mt-1 font-label text-xl font-bold">{receipts.length}</p>
                <p className="text-[10px] opacity-60">receipts total</p>
              </div>
            </div>

            <div aria-hidden className="h-px w-full bg-on-primary/10" />

            {/* AI accuracy row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span aria-hidden className="h-2 w-2 animate-pulse rounded-full bg-secondary-fixed" />
                <span className="font-label text-xs text-secondary-fixed">
                  {avgConfidence !== null
                    ? `AI Accuracy ${(avgConfidence * 100).toFixed(1)}%`
                    : 'AI ready to scan'}
                </span>
              </div>
              <Link
                href="/history"
                className="flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
              >
                View Insights
                <Icon name="arrow_forward" size={16} />
              </Link>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="mb-10 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => router.push('/scan')}
            className="flex flex-col items-start gap-3 rounded-2xl bg-primary px-6 py-5 text-on-primary shadow-lg transition-all duration-200 hover:opacity-90 active:scale-95"
          >
            <div className="rounded-lg bg-on-primary/10 p-2">
              <Icon name="document_scanner" size={24} />
            </div>
            <span className="font-bold tracking-tight">Scan Receipt</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/scan')}
            className="flex flex-col items-start gap-3 rounded-2xl bg-surface-container-high px-6 py-5 text-primary transition-all duration-200 hover:bg-surface-container-highest active:scale-95"
          >
            <div className="rounded-lg bg-primary/5 p-2">
              <Icon name="upload_file" size={24} />
            </div>
            <span className="font-bold tracking-tight">Upload Photo</span>
          </button>
        </section>

        {/* Recent receipts */}
        <div className="mb-6 flex items-end justify-between">
          <h4 className="font-headline text-xl font-bold text-primary">Recent Receipts</h4>
          <Link href="/history" className="font-label text-sm font-bold text-secondary">
            {hasMore ? `View All (${receipts.length})` : 'View All'}
          </Link>
        </div>

        {recentReceipts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <div className="mb-2 flex h-18 w-18 items-center justify-center rounded-3xl bg-surface-container-low">
              <Icon name="receipt_long" size={36} className="text-outline" />
            </div>
            <p className="font-headline text-lg font-bold text-primary">No receipts yet</p>
            <p className="text-sm text-on-surface-variant">
              Scan your first receipt and it will appear here.
            </p>
            <Button
              className="mt-4 max-w-60"
              variant="primary"
              arrow
              onClick={() => router.push('/scan')}
            >
              Scan Receipt
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {recentReceipts.map((receipt, index) => (
              <ReceiptCard key={receipt.id} receipt={receipt} index={index} />
            ))}
            {hasMore && (
              <div className="flex justify-center py-2">
                <Link
                  href="/history"
                  className="font-label text-sm font-bold text-on-surface-variant"
                >
                  {receipts.length - RECENT_RECEIPTS_LIMIT} more in History →
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

export default HomePage
