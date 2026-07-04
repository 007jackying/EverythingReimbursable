import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Null when credentials are absent — the app then runs in local-only mode
// (localStorage persistence, no auth backend, no image uploads).
export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export const STORAGE_BUCKET = 'receipt-images'

export const isSupabaseConfigured = (): boolean => supabase !== null
