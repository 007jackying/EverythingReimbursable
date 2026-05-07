/* eslint-disable no-console */
import { ReceiptCategory } from '@/types/receipt'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as FileSystem from 'expo-file-system/legacy'

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.error('EXPO_PUBLIC_GEMINI_API_KEY not set. AI extraction will fail.')
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null

const model = genAI?.getGenerativeModel({ model: 'gemini-3-pro-preview' })

const MAX_RETRIES = 5
const INITIAL_DELAY = 1000

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

export interface ExtractedReceiptData {
  companyName: string
  address: string | null
  date: string
  totalAmount: number
  taxAmount: number | null
  currency: string
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'E-Wallet' | null
  paymentLast4: string | null
  category: ReceiptCategory
  confidence: number
  eInvoiceId: string | null
}

const CATEGORY_MAP: Record<string, ReceiptCategory> = {
  restaurant: 'dining',
  cafe: 'dining',
  coffee: 'dining',
  food: 'dining',
  grocery: 'grocery',
  supermarket: 'grocery',
  electronics: 'electronics',
  technology: 'electronics',
  travel: 'travel',
  hotel: 'travel',
  airline: 'travel',
  transport: 'transport',
  taxi: 'transport',
  uber: 'transport',
  grab: 'transport',
  healthcare: 'healthcare',
  pharmacy: 'healthcare',
  medical: 'healthcare',
  utilities: 'utilities',
  electric: 'utilities',
  water: 'utilities',
  internet: 'utilities'
}

const inferCategory = (merchantName: string): ReceiptCategory => {
  const lower = merchantName.toLowerCase()
  const entry = Object.entries(CATEGORY_MAP).find(([keyword]) => lower.includes(keyword))
  return entry ? entry[1] : 'other'
}

const extractReceiptPrompt = `You are a receipt OCR specialist. Analyze this receipt image and extract the following information in JSON format:

{
  "companyName": "string - merchant/store name",
  "address": "string or null - full address if visible",
  "date": "string or null - receipt date in ISO 8601 format (YYYY-MM-DD). Parse any date format shown on the receipt.",
  "totalAmount": "number - final total amount (including tax)",
  "taxAmount": "number or null - tax amount if shown",
  "currency": "string - 3-letter currency code (USD, MYR, EUR, GBP, SGD, etc.)",
  "paymentMethod": "string or null - one of: Cash, Credit Card, Debit Card, E-Wallet",
  "paymentLast4": "string or null - last 4 digits of card if card payment",
  "eInvoiceId": "string or null - invoice/receipt number if visible",
  "confidence": "number between 0 and 1 - your confidence in the extraction"
}

Rules:
- Extract ONLY what is clearly visible on the receipt
- If a field is not visible or unclear, use null
- totalAmount must be the FINAL total (after tax)
- date must be in YYYY-MM-DD format. Parse common formats like "Oct 24, 2024", "24/10/2024", "10/24/2024", etc.
- confidence should reflect how clear and complete the extraction is
- Return ONLY valid JSON, no markdown or explanation`

const generateContentWithRetry = async (
  prompt: string,
  imageData: { mimeType: string; data: string },
  retryCount = 0
): Promise<string> => {
  if (!model) {
    throw new Error('Gemini AI not initialized')
  }

  try {
    console.log(`[Gemini] Calling API (attempt ${retryCount + 1}/${MAX_RETRIES})...`)
    const result = await model.generateContent([prompt, { inlineData: imageData }])
    console.log('[Gemini] API call successful')
    return result.response.text()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const is503 = errorMessage.includes('503') || errorMessage.includes('high demand')

    if (is503 && retryCount < MAX_RETRIES - 1) {
      const delay = INITIAL_DELAY * 2 ** retryCount
      console.log(`[Gemini] Got 503 error, retrying in ${delay}ms...`)
      await sleep(delay)
      return generateContentWithRetry(prompt, imageData, retryCount + 1)
    }

    console.error('[Gemini] API call failed after', retryCount + 1, 'attempts:', errorMessage)
    throw error
  }
}

export const extractReceiptData = async (imageUri: string): Promise<ExtractedReceiptData> => {
  console.log('[Gemini] extractReceiptData called with imageUri:', imageUri)

  if (!model) {
    throw new Error('Gemini AI not initialized. Set EXPO_PUBLIC_GEMINI_API_KEY in .env')
  }

  // Try to read the file directly first
  console.log('[Gemini] Attempting to read file directly...')
  try {
    const base64Data = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64
    })
    console.log('[Gemini] Successfully read file, base64 length:', base64Data.length)

    // Detect mime type from URI or default to jpeg
    const mimeType = imageUri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
    console.log('[Gemini] Mime type:', mimeType)

    const responseText = await generateContentWithRetry(extractReceiptPrompt, {
      mimeType,
      data: base64Data
    })
    console.log('[Gemini] Response text:', responseText)

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])
    console.log('[Gemini] Parsed data:', parsed)

    const extractedData: ExtractedReceiptData = {
      companyName: parsed.companyName || 'Unknown Merchant',
      address: parsed.address || null,
      date: parsed.date || new Date().toISOString().split('T')[0],
      totalAmount: typeof parsed.totalAmount === 'number' ? parsed.totalAmount : 0,
      taxAmount: typeof parsed.taxAmount === 'number' ? parsed.taxAmount : null,
      currency: parsed.currency || 'USD',
      paymentMethod: parsed.paymentMethod || null,
      paymentLast4: parsed.paymentLast4 || null,
      category: inferCategory(parsed.companyName || ''),
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
      eInvoiceId: parsed.eInvoiceId || null
    }

    return extractedData
  } catch (directReadError) {
    console.log('[Gemini] Direct read failed:', directReadError)
    console.log('[Gemini] Trying to copy file to accessible location...')
  }

  // If direct read fails, try copying to cache
  let fileUri = imageUri

  // For content:// URIs (Android) or assets-library:// (iOS), copy to cache first
  if (imageUri.startsWith('content://') || imageUri.startsWith('assets-library://')) {
    console.log('[Gemini] Content/asset URI detected, copying to cache...')
    const fileName = `receipt-${Date.now()}.jpg`
    const cacheDir = FileSystem.cacheDirectory
    if (!cacheDir) {
      throw new Error('Cache directory not available')
    }
    const destUri = `${cacheDir}${fileName}`
    await FileSystem.copyAsync({ from: imageUri, to: destUri })
    fileUri = destUri
    console.log('[Gemini] Copied to:', fileUri)
  } else if (imageUri.includes('ImagePicker')) {
    // ImagePicker URIs might need special handling
    console.log('[Gemini] ImagePicker URI detected, copying to cache...')
    const fileName = `receipt-${Date.now()}.jpg`
    const cacheDir = FileSystem.cacheDirectory
    if (!cacheDir) {
      throw new Error('Cache directory not available')
    }
    const destUri = `${cacheDir}${fileName}`
    try {
      await FileSystem.copyAsync({ from: imageUri, to: destUri })
      fileUri = destUri
      console.log('[Gemini] Copied to:', fileUri)
    } catch (copyError) {
      console.error('[Gemini] Copy failed:', copyError)
      throw new Error(`Failed to access image file: ${copyError}`)
    }
  }

  // Check if file exists
  console.log('[Gemini] Checking if file exists at:', fileUri)
  try {
    const fileInfo = await FileSystem.getInfoAsync(fileUri)
    console.log('[Gemini] File info:', JSON.stringify(fileInfo))
    if (!fileInfo.exists) {
      console.error('[Gemini] File does not exist')
      throw new Error(`Image file not found: ${fileUri}`)
    }
    console.log('[Gemini] File exists, size:', (fileInfo as any).size || 'unknown')
  } catch (error) {
    console.error('[Gemini] Error checking file:', error)
    throw error
  }

  // Read as base64
  console.log('[Gemini] Reading file as base64...')
  const base64Data = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64
  })
  console.log('[Gemini] Base64 data length:', base64Data.length)

  // Detect mime type from URI or default to jpeg
  const mimeType = fileUri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'

  const responseText = await generateContentWithRetry(extractReceiptPrompt, {
    mimeType,
    data: base64Data
  })

  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('No JSON found in response')
  }

  const parsed = JSON.parse(jsonMatch[0])

  const extractedData: ExtractedReceiptData = {
    companyName: parsed.companyName || 'Unknown Merchant',
    address: parsed.address || null,
    date: parsed.date || new Date().toISOString().split('T')[0],
    totalAmount: typeof parsed.totalAmount === 'number' ? parsed.totalAmount : 0,
    taxAmount: typeof parsed.taxAmount === 'number' ? parsed.taxAmount : null,
    currency: parsed.currency || 'USD',
    paymentMethod: parsed.paymentMethod || null,
    paymentLast4: parsed.paymentLast4 || null,
    category: inferCategory(parsed.companyName || ''),
    confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.85,
    eInvoiceId: parsed.eInvoiceId || null
  }

  return extractedData
}
