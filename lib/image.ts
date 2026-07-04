// Canvas-based image helpers — receipts don't need more than ~1280px for OCR.

export const compressImage = async (blob: Blob, maxWidth = 1280, quality = 0.8): Promise<Blob> => {
  const bitmap = await createImageBitmap(blob)
  const scale = Math.min(1, maxWidth / bitmap.width)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (out) => (out ? resolve(out) : reject(new Error('Image compression failed'))),
      'image/jpeg',
      quality
    )
  })
}

export const blobToDataUrl = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

// Raw base64 without the data: prefix — the shape the Gemini API expects
export const blobToBase64 = async (blob: Blob): Promise<string> =>
  (await blobToDataUrl(blob)).split(',')[1]
