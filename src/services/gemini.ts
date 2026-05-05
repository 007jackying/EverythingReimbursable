import { GoogleGenerativeAI } from '@google/generative-ai'
import * as FileSystem from 'expo-file-system'
import { ReceiptCategory } from '@/types/receipt'

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY

if (!GEMINI_API_KEY) {
  console.warn('EXPO_PUBLIC_GEMINI_API_KEY not set. AI extraction will use mock data.')
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null

const model = genAI?.getGenerativeModel({ model: 'gemini-3.1-pro-preview' })

export interface ExtractedReceiptData {
  companyName: string
  address: string | null
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
  for (const [keyword, category] of Object.entries(CATEGORY_MAP)) {
    if (lower.includes(keyword)) return category
  }
  return 'other'
}

const extractReceiptPrompt = `You are a receipt OCR specialist. Analyze this receipt image and extract the following information in JSON format:

{
  "companyName": "string - merchant/store name",
  "address": "string or null - full address if visible",
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
- confidence should reflect how clear and complete the extraction is
- Return ONLY valid JSON, no markdown or explanation`

export const extractReceiptData = async (imageUri: string): Promise<ExtractedReceiptData> => {
  if (!model) {
    console.warn('Gemini AI not initialized, using mock data')
    return mockExtract(imageUri)
  }

  try {
    const base64Data = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64'
    })

    const result = await model.generateContent([
      extractReceiptPrompt,
      {
        inlineData: {
          mimeType: 'image/jpeg',
          data: base64Data
        }
      }
    ])

    const responseText = result.response.text()

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in response')
    }

    const parsed = JSON.parse(jsonMatch[0])

    const extractedData: ExtractedReceiptData = {
      companyName: parsed.companyName || 'Unknown Merchant',
      address: parsed.address || null,
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
  } catch (error) {
    console.error('Gemini extraction error:', error)
    return mockExtract(imageUri)
  }
}

const mockExtract = async (_imageUri: string): Promise<ExtractedReceiptData> => {
  await new Promise<void>((res) => {
    setTimeout(res, 3500)
  })
  return {
    companyName: 'Blue Bottle Coffee',
    address: '300 S Broadway, Los Angeles, CA',
    totalAmount: 42.5,
    taxAmount: 3.75,
    currency: 'USD',
    paymentMethod: 'Credit Card',
    paymentLast4: '4242',
    category: 'dining',
    confidence: 0.984,
    eInvoiceId: null
  }
}
