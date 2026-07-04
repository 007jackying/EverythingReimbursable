'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Icon from '@/components/Icon'
import Button from '@/components/Button'
import { useReceipts } from '@/lib/receipts'
import {
  getPendingExtraction,
  getPendingImage,
  setPendingExtraction,
  setPendingImage
} from '@/lib/pending'
import { formatAmount, formatDate, getCurrencySymbol } from '@/lib/format'
import {
  APP_NAME,
  CATEGORY_LABELS,
  type ExtractedReceiptData,
  type Receipt,
  type ReceiptStatus
} from '@/lib/types'

// Receipts at or above this confidence are auto-verified; lower ones stay
// pending for manual review (RN flow marks new extractions verified — the
// pending fallback keeps low-confidence results honest).
const VERIFIED_CONFIDENCE_THRESHOLD = 0.8

const statusForConfidence = (confidence: number): ReceiptStatus =>
  confidence >= VERIFIED_CONFIDENCE_THRESHOLD ? 'verified' : 'pending'

const todayIso = () => new Date().toISOString().split('T')[0]

interface PendingReview {
  data: ExtractedReceiptData
  imageUrl: string
}

const ReviewContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const isNew = !id
  const { receipts, isLoading, addReceipt, updateReceipt, deleteReceipt } = useReceipts()

  // New-receipt mode: pull the extraction + image left by /processing.
  // undefined = still resolving, null = nothing pending (redirect to /scan).
  const [pending, setPending] = useState<PendingReview | null | undefined>(
    isNew ? undefined : null
  )

  const [isEditing, setIsEditing] = useState(false)
  const [overrides, setOverrides] = useState<{
    name: string
    amount: number
    notes: string | null
  } | null>(null)
  const [editName, setEditName] = useState('')
  const [editAmount, setEditAmount] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isNew) return
    const data = getPendingExtraction()
    if (!data) {
      setPending(null)
      router.replace('/scan')
      return
    }
    const file = getPendingImage()
    const imageUrl = file ? URL.createObjectURL(file) : ''
    setPending({ data, imageUrl })
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl)
    }
  }, [isNew, router])

  const stored = !isNew ? receipts.find((r) => r.id === id) : undefined

  // Resolve the base receipt view for either mode
  const base = isNew
    ? pending
      ? {
          ...pending.data,
          date: pending.data.date || todayIso(),
          imageUri: pending.imageUrl,
          status: statusForConfidence(pending.data.confidence),
          notes: null as string | null
        }
      : null
    : (stored ?? null)

  // Still resolving (pending image lookup, or receipts store hydrating)
  if ((isNew && pending === undefined) || (!isNew && isLoading && !stored)) {
    return <div className="min-h-dvh bg-background" />
  }

  // Existing receipt not found
  if (!base) {
    if (isNew) return <div className="min-h-dvh bg-background" />
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-8 text-center">
        <Icon name="error_outline" size={64} className="text-outline" />
        <h1 className="font-headline text-2xl font-bold text-primary">Receipt Not Found</h1>
        <p className="font-body text-[15px] text-on-surface-variant">
          This receipt may have been deleted.
        </p>
        <Button className="max-w-60" onClick={() => router.push('/history')}>
          Back to History
        </Button>
      </div>
    )
  }

  const view = {
    ...base,
    companyName: overrides?.name ?? base.companyName,
    totalAmount: overrides?.amount ?? base.totalAmount,
    notes: overrides ? overrides.notes : base.notes
  }

  const startEdit = () => {
    setEditName(view.companyName)
    setEditAmount(String(view.totalAmount))
    setEditNotes(view.notes ?? '')
    setIsEditing(true)
  }

  const commitEdit = () => {
    setOverrides({
      name: editName.trim() || view.companyName,
      amount: parseFloat(editAmount) || view.totalAmount,
      notes: editNotes.trim() || null
    })
    setIsEditing(false)
  }

  const cancelEdit = () => setIsEditing(false)

  const handleSave = async () => {
    // Uncommitted edit-mode values still count when saving directly
    const finalName = isEditing ? editName.trim() || view.companyName : view.companyName
    const finalAmount = isEditing ? parseFloat(editAmount) || view.totalAmount : view.totalAmount
    const finalNotes = isEditing ? editNotes.trim() || null : view.notes

    setIsSaving(true)
    try {
      if (isNew && pending) {
        const receipt: Receipt = {
          ...pending.data,
          id: crypto.randomUUID(),
          companyName: finalName,
          totalAmount: finalAmount,
          date: pending.data.date || todayIso(),
          imageUri: pending.imageUrl,
          status: statusForConfidence(pending.data.confidence),
          createdAt: new Date().toISOString(),
          notes: finalNotes
        }
        await addReceipt(receipt)
        setPendingImage(null)
        setPendingExtraction(null)
      } else if (stored) {
        await updateReceipt(stored.id, {
          companyName: finalName,
          totalAmount: finalAmount,
          notes: finalNotes
        })
      }
      router.replace('/home')
    } catch {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!stored) return
    if (!window.confirm(`Delete receipt from ${stored.companyName}?`)) return
    await deleteReceipt(stored.id)
    router.replace('/history')
  }

  const isVerified = view.status === 'verified'

  return (
    <div className="min-h-dvh bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 flex w-full items-center justify-between bg-background px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="text-primary transition-transform duration-200 active:scale-95"
          >
            <Icon name="arrow_back" size={24} />
          </button>
          <h1 className="font-headline text-xl font-bold tracking-tighter text-primary">
            {APP_NAME}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && stored && (
            <button
              type="button"
              onClick={handleDelete}
              aria-label="Delete receipt"
              className="text-outline transition-transform duration-200 active:scale-95"
            >
              <Icon name="delete" size={22} />
            </button>
          )}
          <button
            type="button"
            onClick={isEditing ? commitEdit : startEdit}
            aria-label={isEditing ? 'Confirm edits' : 'Edit receipt'}
            className={`transition-transform duration-200 active:scale-95 ${
              isEditing ? 'text-secondary' : 'text-primary'
            }`}
          >
            <Icon name={isEditing ? 'check_circle' : 'edit'} size={22} />
          </button>
        </div>
      </header>

      <main className="px-6 pb-16 pt-4">
        <span className="mb-2 block font-label text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant">
          Validation Stage
        </span>
        <h2 className="mb-8 font-headline text-4xl font-bold leading-none tracking-tight text-primary">
          Review Receipt
        </h2>

        {/* Main card */}
        <div className="relative mb-6 overflow-hidden rounded-3xl bg-surface-container-lowest p-8 shadow-editorial">
          {/* AI verification badge */}
          <div className="absolute right-5 top-5">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 ${
                isVerified ? 'bg-secondary-container' : 'bg-surface-container-high'
              }`}
            >
              <div
                className={`h-2 w-2 rounded-full ${isVerified ? 'bg-secondary' : 'bg-outline'}`}
              />
              <span
                className={`font-label text-[10px] font-bold uppercase tracking-wider ${
                  isVerified ? 'text-on-secondary-container' : 'text-on-surface-variant'
                }`}
              >
                {isVerified ? 'AI Verified' : 'Pending'}
              </span>
            </div>
          </div>

          <div className="mb-10">
            <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Merchant
            </p>
            {isEditing ? (
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Merchant name"
                aria-label="Merchant name"
                className="mr-16 w-[calc(100%-4rem)] rounded-xl bg-surface-container-low px-3 py-2 font-headline text-xl font-bold text-primary outline-none placeholder:text-outline/60 focus:ring-2 focus:ring-primary/10"
              />
            ) : (
              <h3 className="font-headline text-2xl font-bold text-primary">{view.companyName}</h3>
            )}
            {view.address && !isEditing && (
              <p className="mt-1 font-body text-sm text-on-surface-variant">{view.address}</p>
            )}
          </div>

          {/* Grand total */}
          <div className="mb-10 flex flex-col items-start">
            <p className="mb-2 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
              Grand Total
            </p>
            {isEditing ? (
              <div className="flex w-full items-center gap-2">
                <span className="font-label text-2xl font-medium text-primary-container">
                  {getCurrencySymbol(view.currency)}
                </span>
                <input
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  inputMode="decimal"
                  aria-label="Total amount"
                  className="w-full rounded-xl bg-surface-container-low px-3 py-1 font-label text-4xl font-bold text-primary outline-none focus:ring-2 focus:ring-primary/10"
                />
              </div>
            ) : (
              <div className="flex items-baseline gap-2">
                <span className="font-label text-2xl font-medium text-primary-container">
                  {getCurrencySymbol(view.currency)}
                </span>
                <span className="font-label text-6xl font-bold tracking-tighter text-primary">
                  {view.totalAmount.toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Metadata grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 border-t border-outline-variant/15 pt-8">
            <div>
              <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Date
              </p>
              <p className="font-body font-semibold text-on-surface">{formatDate(view.date)}</p>
            </div>
            <div>
              <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Payment Method
              </p>
              {view.paymentMethod ? (
                <div className="flex items-center gap-2">
                  <Icon name="credit_card" size={16} className="text-primary" />
                  <p className="font-body font-semibold text-on-surface">
                    {view.paymentMethod}
                    {view.paymentLast4 ? ` •• ${view.paymentLast4}` : ''}
                  </p>
                </div>
              ) : (
                <p className="font-body font-semibold text-on-surface">N/A</p>
              )}
            </div>
            <div>
              <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Category
              </p>
              <span className="inline-flex items-center rounded-full bg-secondary-container px-3 py-1 font-label text-[11px] font-bold uppercase text-on-secondary-container">
                {CATEGORY_LABELS[view.category]}
              </span>
            </div>
            <div>
              <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Tax (Included)
              </p>
              <p className="font-label font-medium text-on-surface">
                {view.taxAmount != null ? formatAmount(view.taxAmount, view.currency) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Notes (edit mode) */}
          {isEditing && (
            <div className="mt-8 rounded-xl bg-surface-container-low p-4">
              <p className="mb-2 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                Notes
              </p>
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add a note..."
                aria-label="Notes"
                rows={3}
                className="w-full resize-none bg-transparent font-body text-sm text-primary outline-none placeholder:text-outline/60"
              />
            </div>
          )}

          {/* E-Invoice ID */}
          {view.eInvoiceId && !isEditing && (
            <div className="mt-8 rounded-xl bg-surface-container-low p-4">
              <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                E-Invoice ID
              </p>
              <p className="font-label text-sm font-bold tracking-tight text-primary/80">
                {view.eInvoiceId}
              </p>
            </div>
          )}
        </div>

        {/* Receipt image */}
        <div className="relative mb-6 h-48 overflow-hidden rounded-3xl bg-surface-container-low">
          {view.imageUri ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={view.imageUri}
                alt={`Receipt from ${view.companyName}`}
                className="h-full w-full object-cover opacity-60"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => window.open(view.imageUri, '_blank', 'noopener')}
                  className="flex items-center gap-2 rounded-2xl bg-surface-container-lowest/90 px-6 py-3 shadow-editorial backdrop-blur-md transition-transform active:scale-95"
                >
                  <Icon name="zoom_in" size={24} className="text-primary" />
                  <span className="font-headline text-sm font-bold text-primary">
                    View Full Image
                  </span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 opacity-40">
              <Icon name="receipt" size={48} className="text-outline" />
              <span className="font-label text-xs font-bold text-on-surface-variant">
                NO IMAGE
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button onClick={handleSave} loading={isSaving} arrow>
            Save Receipt
          </Button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={isEditing ? cancelEdit : startEdit}
              className="flex h-13 flex-1 items-center justify-center gap-2 rounded-xl border border-outline-variant/30 transition-colors duration-200 hover:bg-surface-container-high active:scale-[0.98]"
            >
              <Icon name={isEditing ? 'close' : 'edit'} size={20} className="text-primary" />
              <span className="font-headline text-sm font-bold text-primary">
                {isEditing ? 'Cancel' : 'Edit'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => router.replace('/scan')}
              className="flex h-13 flex-1 items-center justify-center gap-2 rounded-xl border border-outline-variant/30 transition-colors duration-200 hover:bg-surface-container-high active:scale-[0.98]"
            >
              <Icon name="document_scanner" size={20} className="text-primary" />
              <span className="font-headline text-sm font-bold text-primary">Re-scan</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

// useSearchParams requires a Suspense boundary in the App Router
const ReviewPage = () => (
  <Suspense fallback={<div className="min-h-dvh bg-background" />}>
    <ReviewContent />
  </Suspense>
)

export default ReviewPage
