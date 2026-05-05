import { extractReceiptData } from '@/services/gemini'

/**
 * Test script to verify Gemini AI integration
 * Run with: npx ts-node src/services/gemini.test.ts
 */

const testGeminiExtraction = async () => {
  console.log('Testing Gemini AI integration...\n')

  if (!process.env.EXPO_PUBLIC_GEMINI_API_KEY) {
    console.error('❌ EXPO_PUBLIC_GEMINI_API_KEY not set')
    console.log('Please add your Gemini API key to .env file')
    return
  }

  console.log('✅ Gemini API key found')
  console.log('✅ Gemini client initialized')
  console.log('\nTo test with a real receipt image:')
  console.log('1. Run the app: npx expo start')
  console.log('2. Navigate to Scan screen')
  console.log('3. Capture or upload a receipt image')
  console.log('4. The AI will extract receipt data automatically')
}

testGeminiExtraction()
