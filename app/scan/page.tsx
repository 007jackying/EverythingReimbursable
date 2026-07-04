'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Icon from '@/components/Icon'
import { setPendingImage } from '@/lib/pending'

// Web replacement for the native camera: upload a receipt image (file picker
// opens the camera directly on mobile browsers) or drag-and-drop onto the page.
const ScanPage = () => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file: File | null | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    setPendingImage(file)
    router.push('/processing')
  }

  return (
    <div
      className={`relative flex min-h-dvh flex-col items-center justify-center bg-primary-container px-8 text-center ${
        isDragging ? 'ring-4 ring-inset ring-secondary-container' : ''
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFile(e.dataTransfer.files?.[0])
      }}
    >
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Close"
        className="absolute left-6 top-6 flex h-11 w-11 items-center justify-center rounded-full bg-on-primary/10 text-on-primary transition-transform duration-200 active:scale-95"
      >
        <Icon name="close" size={24} />
      </button>

      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-on-primary/15">
        <Icon name="upload_file" size={48} className="text-on-primary" />
      </div>

      <h1 className="mb-3 font-headline text-2xl font-bold text-on-primary">Upload a Receipt</h1>
      <p className="mb-8 max-w-xs font-body text-[15px] leading-relaxed text-on-primary-container">
        Take a photo or choose a receipt image from your device — or drag and drop one anywhere on
        this page.
      </p>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-full bg-secondary px-8 py-4 font-label text-sm font-bold tracking-wider text-on-secondary transition-transform duration-200 active:scale-[0.98]"
      >
        Choose Image
      </button>

      <button
        type="button"
        onClick={() => router.back()}
        className="mt-4 px-4 py-3 font-label text-[13px] font-bold text-on-primary-container"
      >
        Cancel
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0])
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default ScanPage
