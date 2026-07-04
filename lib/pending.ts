// Carries the picked receipt image and its extraction result across client-side
// navigations (/scan → /processing → /review). Module memory is enough — a hard
// refresh mid-flow simply sends the user back to /scan.
import type { ExtractedReceiptData } from './types'

let pendingImage: File | null = null
let pendingExtraction: ExtractedReceiptData | null = null

export const setPendingImage = (file: File | null) => {
  pendingImage = file
}

export const getPendingImage = () => pendingImage

export const setPendingExtraction = (data: ExtractedReceiptData | null) => {
  pendingExtraction = data
}

export const getPendingExtraction = () => pendingExtraction
