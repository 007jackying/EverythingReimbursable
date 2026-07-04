import type { ExtractedReceiptData } from './types'
import { blobToBase64, compressImage } from './image'

// Client entry point for AI extraction — compresses the image, then hands it
// to the server route so the Gemini key never reaches the browser.
export const extractReceiptData = async (image: Blob): Promise<ExtractedReceiptData> => {
  let payload = image
  try {
    payload = await compressImage(image, 1280, 0.8)
  } catch {
    // Compression unavailable — send the original image
  }

  const res = await fetch('/api/extract', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: await blobToBase64(payload), mimeType: 'image/jpeg' })
  })

  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error ?? 'Extraction failed')
  }
  return data as ExtractedReceiptData
}
