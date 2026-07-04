import { GoogleGenerativeAI } from '@google/generative-ai'
import type { ExtractedReceiptData, ReceiptCategory } from '@/lib/types'

// Gemini call plus up to 3 retries with backoff can exceed Vercel's default
// 10s function limit; allow up to 60s (Hobby max).
export const maxDuration = 60

const GEMINI_MODEL = process.env.GEMINI_MODEL_NAME
const MAX_RETRIES = 3
const INITIAL_DELAY = 1000

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

const EXTRACT_PROMPT = `You are a receipt OCR specialist. Analyze this image and extract the following information in JSON format:

{
  "isReceipt": "boolean - true only if this image is actually a receipt or invoice; false for anything else (selfies, screenshots, random photos, documents)",
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
- Set isReceipt to false if the image is not a receipt/invoice — still return the JSON with other fields null/0
- Extract ONLY what is clearly visible on the receipt
- If a field is not visible or unclear, use null
- totalAmount must be the FINAL total (after tax)
- date must be in YYYY-MM-DD format. Parse common formats like "Oct 24, 2024", "24/10/2024", "10/24/2024", etc.
- confidence should reflect how clear and complete the extraction is
- Return ONLY valid JSON, no markdown or explanation`

type ImageData = { mimeType: string; data: string }

const withRetry = async (generate: () => Promise<string>): Promise<string> => {
  let lastError: unknown
  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      return await generate()
    } catch (error) {
      lastError = error
      const message = error instanceof Error ? error.message : String(error)
      const isRetryable =
        message.includes('503') || message.includes('429') || message.includes('high demand')
      if (!isRetryable || attempt === MAX_RETRIES - 1) throw error
      await new Promise((r) => {
        setTimeout(r, INITIAL_DELAY * 2 ** attempt)
      })
    }
  }
  throw lastError
}

const generateWithGemini = (apiKey: string, imageData: ImageData): Promise<string> =>
  withRetry(async () => {
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: GEMINI_MODEL! })
    const result = await model.generateContent([EXTRACT_PROMPT, { inlineData: imageData }])
    return result.response.text()
  })

// OpenRouter is OpenAI-compatible — a plain JSON POST, so no SDK dependency needed.
// ponytail: fetch over the openai SDK; swap in `openai` only if you need streaming/tool-calls.
const generateWithOpenRouter = (apiKey: string, model: string, imageData: ImageData): Promise<string> =>
  withRetry(async () => {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: EXTRACT_PROMPT },
              {
                type: 'image_url',
                image_url: { url: `data:${imageData.mimeType};base64,${imageData.data}` }
              }
            ]
          }
        ]
      })
    })
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
    const json = await res.json()
    return json.choices?.[0]?.message?.content ?? ''
  })

const parseResponse = (responseText: string): { isReceipt: boolean; data: ExtractedReceiptData } => {
  const jsonMatch = responseText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON found in response')
  const parsed = JSON.parse(jsonMatch[0])

  const data: ExtractedReceiptData = {
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

  return { isReceipt: parsed.isReceipt !== false, data }
}

export const POST = async (req: Request): Promise<Response> => {
  // GEMINI_MODEL_NAME wins; otherwise fall back to OpenRouter if configured.
  const geminiKey = process.env.GEMINI_API_KEY
  const openRouterKey = process.env.OPEN_ROUTER_API_KEY
  const openRouterModel = process.env.OPEN_ROUTER_MODEL_NAME

  const useGemini = Boolean(GEMINI_MODEL && geminiKey)
  const useOpenRouter = !useGemini && Boolean(openRouterKey && openRouterModel)
  if (!useGemini && !useOpenRouter) {
    return Response.json(
      {
        error:
          'No AI provider configured. Set GEMINI_MODEL_NAME + GEMINI_API_KEY, or OPEN_ROUTER_API_KEY + OPEN_ROUTER_MODEL_NAME.'
      },
      { status: 500 }
    )
  }

  let body: { image?: string; mimeType?: string }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  if (!body.image) {
    return Response.json({ error: 'Missing image data' }, { status: 400 })
  }

  const imageData: ImageData = { mimeType: body.mimeType ?? 'image/jpeg', data: body.image }
  try {
    const text = useGemini
      ? await generateWithGemini(geminiKey!, imageData)
      : await generateWithOpenRouter(openRouterKey!, openRouterModel!, imageData)
    const { isReceipt, data } = parseResponse(text)
    if (!isReceipt) {
      return Response.json(
        { error: "This doesn't look like a receipt. Please try another photo.", notReceipt: true },
        { status: 422 }
      )
    }
    return Response.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Extraction failed'
    console.error(`[extract] ${useGemini ? 'Gemini' : 'OpenRouter'} call failed:`, message)
    return Response.json({ error: message }, { status: 502 })
  }
}
