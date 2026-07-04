'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import Button from '@/components/Button'
import { extractReceiptData } from '@/lib/extract'
import { getPendingImage, setPendingExtraction } from '@/lib/pending'
import { formatAmount } from '@/lib/format'
import { APP_NAME, type ExtractedReceiptData } from '@/lib/types'

// AI extraction progress screen — ports src/app/ai-processing.tsx to the web.
// Picks up the pending image from /scan, runs extraction, then hands the
// result to /review. A hard refresh loses the pending image → back to /scan.
const ProcessingPage = () => {
  const router = useRouter()
  const startedRef = useRef(false)
  const [progress, setProgress] = useState(0)
  const [result, setResult] = useState<ExtractedReceiptData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notReceipt, setNotReceipt] = useState(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    const file = getPendingImage()
    if (!file) {
      router.replace('/scan')
      return
    }

    // Let the bar mount at 0% before easing toward 92% (~3s, snaps to 100% on completion)
    requestAnimationFrame(() => setProgress(92))

    extractReceiptData(file)
      .then((data) => {
        setResult(data)
        setProgress(100)
        setPendingExtraction(data)
        setTimeout(() => router.replace('/review'), 500)
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'We could not read this receipt.')
        if ((err as { notReceipt?: boolean })?.notReceipt) setNotReceipt(true)
      })
  }, [router])

  const confidencePct = result ? result.confidence * 100 : null
  const detectedAmount = result ? formatAmount(result.totalAmount, result.currency) : null

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <style>{`
        @keyframes beam-scan {
          0% { top: 10%; }
          50% { top: 88%; }
          100% { top: 10%; }
        }
      `}</style>

      {/* Header */}
      <header className="flex w-full items-center justify-between px-6 py-4">
        <div className="font-headline text-xl font-bold tracking-tighter text-primary">
          {APP_NAME}
        </div>
        <button
          type="button"
          onClick={() => router.replace('/scan')}
          aria-label="Cancel and go back to scan"
          className="flex h-10 w-10 items-center justify-center rounded-full text-primary transition-opacity hover:opacity-80"
        >
          <Icon name="close" size={24} />
        </button>
      </header>

      <main className="flex w-full grow flex-col items-center px-8 pb-10">
        {/* Animated receipt card */}
        <div className="relative mb-10 mt-6">
          <div
            className={`absolute inset-0 rounded-3xl bg-secondary/10 blur-2xl ${error ? '' : 'animate-pulse'}`}
          />
          <div className="relative flex h-44 w-32 rotate-[-2deg] items-center justify-center overflow-hidden rounded-2xl border border-outline-variant/15 bg-surface-container-lowest shadow-hero">
            <div className="absolute left-4 right-4 top-4 h-1 rounded-full bg-surface-container-high" />
            <div className="absolute left-4 top-8 h-1 w-12 rounded-full bg-surface-container-high" />
            <Icon name="receipt_long" size={48} className="text-primary opacity-20" />
            <div
              className="absolute left-0 right-0 z-20 h-[2px] bg-secondary shadow-[0_0_15px_var(--color-secondary)]"
              style={{ animation: error ? 'none' : 'beam-scan 2s ease-in-out infinite', top: '50%' }}
            />
            <div className="absolute bottom-4 left-4 right-10 h-1 rounded-full bg-surface-container-high" />
            <div className="absolute bottom-8 left-4 right-4 h-1 rounded-full bg-surface-container-high" />
          </div>
        </div>

        {error ? (
          /* Error state */
          <div className="flex w-full max-w-sm flex-col items-center text-center">
            <h2 className="mb-2 font-headline text-2xl font-bold tracking-tight text-primary">
              {notReceipt ? 'Not a Receipt' : 'Extraction Failed'}
            </h2>
            <p className="mb-8 font-body text-sm font-medium text-on-surface-variant">{error}</p>
            <div className="flex w-full flex-col gap-3">
              <Button onClick={() => router.replace('/scan')} arrow>
                {notReceipt ? 'Scan Another' : 'Try Again'}
              </Button>
              <Button variant="ghost" onClick={() => router.replace('/home')}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10 text-center">
              <h2 className="mb-2 font-headline text-2xl font-bold tracking-tight text-primary">
                Extracting receipt details...
              </h2>
              <p className="font-body text-sm font-medium text-on-surface-variant">
                AI is identifying merchants, totals, and line items.
              </p>
            </div>

            {/* Progress bar */}
            <div className="mb-6 h-1.5 w-full max-w-sm overflow-hidden rounded-full bg-surface-container-high">
              <div
                className="h-full rounded-full bg-primary-container shadow-[0_0_8px_var(--color-primary-container)]"
                style={{
                  width: `${progress}%`,
                  transition: `width ${progress === 100 ? 400 : 3000}ms ease-in-out`
                }}
              />
            </div>

            {/* Meta bento */}
            <div className="mb-8 grid w-full max-w-sm grid-cols-2 gap-3">
              <div className="flex flex-col space-y-1 rounded-xl bg-surface-container-low p-4">
                <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Confidence
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-label text-lg font-bold tracking-tighter text-secondary">
                    {confidencePct === null ? '—' : `${confidencePct.toFixed(1)}%`}
                  </span>
                  <svg className="h-4 w-4 -rotate-90 text-secondary" viewBox="0 0 36 36" aria-hidden>
                    <circle
                      className="stroke-secondary/20"
                      cx="18"
                      cy="18"
                      fill="none"
                      r="16"
                      strokeWidth="4"
                    />
                    <circle
                      className="stroke-secondary"
                      cx="18"
                      cy="18"
                      fill="none"
                      r="16"
                      strokeLinecap="round"
                      strokeWidth="4"
                      strokeDasharray="100"
                      strokeDashoffset={100 - (confidencePct ?? 0)}
                    />
                  </svg>
                </div>
              </div>
              <div className="flex flex-col space-y-1 rounded-xl bg-surface-container-low p-4">
                <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                  Processing
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-label text-lg font-bold italic tracking-tighter text-primary">
                    OCR_v4
                  </span>
                  <Icon name="auto_awesome" size={14} filled className="text-primary/40" />
                </div>
              </div>
            </div>

            {/* Privacy badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/10 bg-secondary-container/30 px-3 py-1.5">
              <Icon name="verified" size={14} filled className="text-secondary" />
              <span className="font-label text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
                Bank-Grade Privacy
              </span>
            </div>
            <p className="mb-10 max-w-xs text-center font-body text-[11px] leading-relaxed text-on-surface-variant opacity-60">
              All extractions are encrypted. Your financial data remains private and is never used
              for training third-party models.
            </p>

            {/* Data feed */}
            <div className="flex w-full max-w-sm flex-col gap-3">
              <div className="flex items-center justify-between rounded-2xl bg-surface-container-low p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-container-highest">
                    <Icon name="storefront" size={24} className="text-primary-container" />
                  </div>
                  <div>
                    <p className="font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      Identified Merchant
                    </p>
                    <h4 className="font-headline text-lg font-bold text-primary">
                      {result ? result.companyName : 'Analyzing...'}
                    </h4>
                  </div>
                </div>
                {result && (
                  <div className="rounded-full bg-secondary/10 px-3 py-1">
                    <span className="font-label text-[10px] font-bold text-secondary">
                      VERIFIED
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col rounded-2xl bg-primary-container p-6">
                <p className="font-label text-[10px] font-bold uppercase tracking-widest text-on-primary-container">
                  Detected Amount
                </p>
                <h4 className="mt-1 font-label text-2xl font-black text-on-primary">
                  {detectedAmount ?? '—'}
                </h4>
                {!result && (
                  <div className="mt-4 flex items-center gap-2">
                    <span className="font-body text-[10px] font-medium text-on-primary-container">
                      Categorizing...
                    </span>
                    <div className="flex gap-1">
                      <div className="h-1 w-1 animate-bounce rounded-full bg-on-primary-container" />
                      <div className="h-1 w-1 animate-bounce rounded-full bg-on-primary-container [animation-delay:0.2s]" />
                      <div className="h-1 w-1 animate-bounce rounded-full bg-on-primary-container [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* Floating status notification */}
      {!error && (
        <div className="pointer-events-none fixed bottom-8 left-1/2 z-50 -translate-x-1/2">
          <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest/80 px-5 py-3 shadow-2xl backdrop-blur-xl">
            <div className="h-2 w-2 animate-pulse rounded-full bg-secondary" />
            <p className="whitespace-nowrap font-label text-xs font-bold tracking-wide text-primary">
              {result ? 'AI AGENT: EXTRACTION COMPLETE' : 'AI AGENT: OPTIMIZING IMAGE CONTRAST'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProcessingPage
