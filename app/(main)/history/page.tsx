'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import Button from '@/components/Button'
import { useReceipts } from '@/lib/receipts'
import { formatAmount, formatDate, getMonthYear, isCurrentMonth } from '@/lib/format'
import { getCategoryIcon } from '@/lib/categories'
import { exportReceiptsCsv } from '@/lib/csv'
import { APP_NAME, CATEGORY_LABELS, STATUS_LABELS } from '@/lib/types'
import type { Receipt, ReceiptStatus } from '@/lib/types'
import { useAuth } from '@/lib/auth'

type FilterMode = 'All' | 'This Month' | 'By Category' | 'Filters'

const FILTER_MODES: FilterMode[] = ['All', 'This Month', 'By Category', 'Filters']

const STATUS_OPTIONS: { label: string; value: ReceiptStatus | 'all' }[] = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Verified', value: 'verified' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' }
]

const historyStyles = `
@keyframes history-list-enter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.history-list-enter { animation: history-list-enter 240ms ease-out both; }
@keyframes history-sheet-up {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.history-sheet-up { animation: history-sheet-up 280ms ease-out both; }
`

const getEmptySubtext = (query: string, filter: FilterMode) => {
  if (query) return `No receipts match "${query}"`
  if (filter === 'This Month') return 'You have not added any receipts this month.'
  return 'Scan your first receipt to get started.'
}

const matchesSearch = (receipt: Receipt, search: string): boolean => {
  if (!search.trim()) return true
  const query = search.toLowerCase()
  return (
    receipt.companyName.toLowerCase().includes(query) ||
    receipt.category.toLowerCase().includes(query) ||
    (receipt.notes?.toLowerCase().includes(query) ?? false)
  )
}

const StatusChip = ({ status }: { status: ReceiptStatus }) => {
  if (status === 'verified') {
    return (
      <span className="flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 font-label text-[10px] font-bold uppercase text-secondary">
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-secondary" />
        Verified
      </span>
    )
  }
  if (status === 'pending') {
    return (
      <span className="rounded-full bg-outline/10 px-2 py-0.5 font-label text-[10px] font-bold uppercase text-outline">
        Pending
      </span>
    )
  }
  return (
    <span className="rounded-full bg-error-container px-2 py-0.5 font-label text-[10px] font-bold uppercase text-error">
      Failed
    </span>
  )
}

const ReceiptRow = ({ receipt, index }: { receipt: Receipt; index: number }) => (
  <Link
    href={`/review?id=${receipt.id}`}
    className="history-list-enter flex items-center gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-editorial transition-shadow hover:shadow-md"
    style={{ animationDelay: `${Math.min(index, 10) * 60}ms` }}
  >
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-surface-container-low text-primary">
      <Icon name={getCategoryIcon(receipt.category)} size={24} />
    </div>
    <div className="min-w-0 flex-1">
      <div className="flex items-start justify-between">
        <h3 className="truncate pr-2 font-bold text-primary">{receipt.companyName}</h3>
        <span className="shrink-0 font-label text-sm font-bold text-primary">
          {formatAmount(receipt.totalAmount, receipt.currency)}
        </span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-on-surface-variant">
          {formatDate(receipt.date)}
        </span>
        <span aria-hidden className="h-1 w-1 rounded-full bg-outline-variant" />
        <span className="rounded-full bg-primary-container/10 px-2 py-0.5 font-label text-[10px] font-bold uppercase text-primary-container">
          {CATEGORY_LABELS[receipt.category]}
        </span>
        <StatusChip status={receipt.status} />
      </div>
    </div>
  </Link>
)

const HistoryPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const { receipts } = useReceipts()

  const [filterMode, setFilterMode] = useState<FilterMode>('All')
  const [searchText, setSearchText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ReceiptStatus | 'all'>('all')
  const [sheetOpen, setSheetOpen] = useState(false)

  const filteredReceipts = useMemo(() => {
    let result = receipts

    // Apply search filter
    result = result.filter((r) => matchesSearch(r, searchText))

    // Apply mode-based filters
    if (filterMode === 'This Month') {
      result = result.filter((r) => isCurrentMonth(r.date))
    } else if (filterMode === 'Filters') {
      if (selectedStatus !== 'all') {
        result = result.filter((r) => r.status === selectedStatus)
      }
    }

    // Sort by date descending
    return [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [receipts, filterMode, searchText, selectedStatus])

  const sections = useMemo(() => {
    const grouped = filteredReceipts.reduce<Record<string, Receipt[]>>((acc, r) => {
      const key =
        filterMode === 'By Category' ? (CATEGORY_LABELS[r.category] ?? r.category) : getMonthYear(r.date)
      ;(acc[key] ??= []).push(r)
      return acc
    }, {})
    return Object.entries(grouped).map(([title, data]) => ({ title, data }))
  }, [filteredReceipts, filterMode])

  const isEmpty = filteredReceipts.length === 0

  const handleFilterTabClick = (f: FilterMode) => {
    setFilterMode(f)
    if (f === 'Filters') setSheetOpen(true)
  }

  const initial = (user?.name?.trim().charAt(0) ?? 'U').toUpperCase()

  return (
    <div className="min-h-dvh bg-background">
      <style>{historyStyles}</style>

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

      <main className="px-6 py-4">
        <div className="mt-2 mb-8">
          <h2 className="mb-2 font-headline text-3xl font-extrabold tracking-tight text-primary">
            History
          </h2>
          <p className="font-medium text-on-surface-variant opacity-70">
            Your digital archive of curated expenses.
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center">
            <Icon name="search" size={24} className="text-outline" />
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search merchants or categories..."
            aria-label="Search receipts"
            className="h-12 w-full rounded-xl border-none bg-surface-container-low pr-4 pl-12 text-on-surface transition-all outline-none placeholder:text-outline/60 focus:ring-2 focus:ring-primary/10"
          />
        </div>

        {/* Filter pills */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {FILTER_MODES.map((f) => {
            const active = filterMode === f
            const label =
              f === 'Filters' && selectedStatus !== 'all'
                ? `Status: ${STATUS_LABELS[selectedStatus]}`
                : f
            return (
              <button
                key={f}
                type="button"
                onClick={() => handleFilterTabClick(f)}
                className={`flex shrink-0 items-center gap-1 rounded-full px-5 py-2.5 font-label text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                  active
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'
                }`}
              >
                {f === 'Filters' && <Icon name="tune" size={18} />}
                {label}
              </button>
            )
          })}
        </div>

        {/* Active status filter badge */}
        {filterMode === 'Filters' && selectedStatus !== 'all' && (
          <div className="mb-4 flex">
            <div className="flex items-center gap-2 rounded-full bg-primary-container px-3 py-1">
              <span className="font-label text-[10px] font-bold tracking-wide text-on-primary-container">
                Status: {STATUS_LABELS[selectedStatus]}
              </span>
              <button
                type="button"
                aria-label="Clear status filter"
                onClick={() => setSelectedStatus('all')}
                className="flex items-center text-on-primary-container"
              >
                <Icon name="close" size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Timeline / grouped list */}
        {isEmpty ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-3xl bg-surface-container-low">
              <Icon name="receipt_long" size={40} className="text-outline" />
            </div>
            <p className="font-headline text-xl font-bold text-primary">
              {searchText ? 'No results found' : 'No receipts yet'}
            </p>
            <p className="mb-4 text-sm text-on-surface-variant">
              {getEmptySubtext(searchText, filterMode)}
            </p>
            {!searchText && (
              <Button
                className="max-w-60"
                variant="primary"
                arrow
                onClick={() => router.push('/scan')}
              >
                Scan Receipt
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.title} className="space-y-4">
                <div className="mt-8 mb-2 px-1 font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant/50 first:mt-0">
                  {section.title}
                </div>
                {section.data.map((receipt, index) => (
                  <ReceiptRow key={receipt.id} receipt={receipt} index={index} />
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Export history card */}
        {!isEmpty && (
          <div className="relative mt-12 mb-8 overflow-hidden rounded-2xl bg-surface-container-low p-6">
            <div className="relative z-10">
              <h4 className="mb-1 font-headline text-lg font-bold text-primary">Export History</h4>
              <p className="pr-12 text-sm text-on-surface-variant">
                Download a detailed report of all your receipt data.
              </p>
              <button
                type="button"
                onClick={() => exportReceiptsCsv(receipts)}
                className="mt-4 rounded-xl bg-primary px-6 py-2.5 font-label text-sm font-bold text-on-primary transition-all hover:opacity-90 active:scale-95"
              >
                Download Report
              </button>
            </div>
            <Icon
              name="ios_share"
              size={128}
              className="absolute -right-4 -bottom-4 select-none text-primary/5"
            />
          </div>
        )}
      </main>

      {/* Floating add FAB */}
      <Link
        href="/scan"
        aria-label="Scan a new receipt"
        className="fixed right-6 bottom-28 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-on-secondary shadow-lg transition-transform active:scale-90"
      >
        <Icon name="add" size={30} />
      </Link>

      {/* Status filter sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setSheetOpen(false)}
            className="absolute inset-0 bg-on-surface/40"
          />
          <div className="history-sheet-up absolute bottom-0 left-1/2 w-full max-w-[640px] -translate-x-1/2 rounded-t-2xl bg-surface-container-lowest p-6 pb-10 shadow-hero">
            <div aria-hidden className="mx-auto mb-6 h-1 w-9 rounded-full bg-outline-variant" />
            <h3 className="mb-6 font-headline text-xl font-bold text-primary">Filter Receipts</h3>

            <p className="mb-3 font-label text-[10px] font-bold uppercase tracking-[0.15em] text-on-surface-variant">
              Status
            </p>
            <div className="mb-6 space-y-2">
              {STATUS_OPTIONS.map((opt) => {
                const active = selectedStatus === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedStatus(opt.value)}
                    className={`flex w-full items-center justify-between rounded-xl px-4 py-4 text-left font-semibold transition-colors ${
                      active
                        ? 'bg-primary-container text-on-primary'
                        : 'bg-surface-container-low text-primary'
                    }`}
                  >
                    {opt.label}
                    {active && <Icon name="check" size={16} />}
                  </button>
                )
              })}
            </div>

            <div className="space-y-3">
              <Button variant="primary" arrow onClick={() => setSheetOpen(false)}>
                Apply Filters
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setSelectedStatus('all')
                  setSheetOpen(false)
                }}
              >
                Clear All
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryPage
