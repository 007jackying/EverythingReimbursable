'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Button from '@/components/Button'
import Icon from '@/components/Icon'
import { useAuth } from '@/lib/auth'
import { APP_NAME } from '@/lib/types'

const SLIDES = [
  {
    icon: 'photo_camera',
    title: 'Scan Any Receipt',
    subtitle: 'Point your camera at any receipt. Our AI extracts every detail instantly.'
  },
  {
    icon: 'auto_awesome',
    title: 'AI-Powered Extraction',
    subtitle: 'Merchant, total, date, tax — all captured automatically in seconds.'
  },
  {
    icon: 'bar_chart',
    title: 'Track & Export',
    subtitle: 'Filter by category, search history, and export CSV reports anytime.'
  }
]

const SplashPage = () => {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [slide, setSlide] = useState(0)

  const isLast = slide === SLIDES.length - 1

  useEffect(() => {
    if (isAuthenticated && !isLoading) router.replace('/home')
  }, [isAuthenticated, isLoading, router])

  if (isLoading || isAuthenticated) return null

  const handleNext = () => {
    if (isLast) {
      router.push('/signup')
    } else {
      setSlide((s) => s + 1)
    }
  }

  return (
    <main className="flex min-h-dvh flex-col bg-gradient-to-br from-secondary-container/15 via-background to-secondary-container/15 px-6 pb-8 pt-8">
      {/* Logo + app name */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
          <Icon name="receipt_long" size={28} className="text-on-primary" />
        </div>
        <span className="font-headline text-base font-bold tracking-tight text-primary">
          {APP_NAME}
        </span>
      </div>

      {/* Slide content */}
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
        <div className="mb-2 flex h-24 w-24 items-center justify-center rounded-full bg-secondary/10">
          <Icon name={SLIDES[slide].icon} size={48} className="text-secondary" />
        </div>
        <h1 className="font-headline text-[28px] font-extrabold tracking-tight text-primary">
          {SLIDES[slide].title}
        </h1>
        <p className="max-w-[300px] font-body text-[15px] text-on-surface-variant">
          {SLIDES[slide].subtitle}
        </p>
      </div>

      {/* Pagination dots */}
      <div className="my-6 flex items-center justify-center gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.title}
            type="button"
            onClick={() => setSlide(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === slide}
            className="flex h-8 items-center px-0.5"
          >
            <span
              className={`h-2 rounded-full transition-all duration-200 ${
                i === slide ? 'w-6 bg-primary-container' : 'w-2 bg-outline-variant'
              }`}
            />
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-4">
        <Button onClick={handleNext} arrow>
          {isLast ? 'Get Started' : 'Continue'}
        </Button>
        <p className="flex items-center justify-center py-2 text-center font-body text-sm text-on-surface-variant">
          Already have an account?{' '}
          <Link
            href="/login"
            className="ml-1 font-headline font-bold text-secondary transition-opacity hover:opacity-80"
          >
            Sign In
          </Link>
        </p>
      </div>
    </main>
  )
}

export default SplashPage
