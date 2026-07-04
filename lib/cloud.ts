import { supabase, STORAGE_BUCKET, isSupabaseConfigured } from './supabase'
import { compressImage } from './image'
import type { Receipt, ReceiptCategory, ReceiptStatus } from './types'

const TABLE = 'receipts'

interface ReceiptRow {
  id: string
  user_id: string
  e_invoice_id: string | null
  company_name: string
  address: string | null
  date: string
  total_amount: number
  tax_amount: number | null
  currency: string
  payment_method: string | null
  payment_last4: string | null
  category: string
  image_uri: string
  cloud_path: string | null
  confidence: number
  status: string
  created_at: string
  updated_at: string | null
  notes: string | null
  synced_at: string | null
}

const toRow = (receipt: Receipt, userId: string): ReceiptRow => ({
  id: receipt.id,
  user_id: userId,
  e_invoice_id: receipt.eInvoiceId,
  company_name: receipt.companyName,
  address: receipt.address,
  date: receipt.date,
  total_amount: receipt.totalAmount,
  tax_amount: receipt.taxAmount,
  currency: receipt.currency,
  payment_method: receipt.paymentMethod,
  payment_last4: receipt.paymentLast4,
  category: receipt.category,
  image_uri: receipt.imageUri,
  cloud_path: receipt.cloudPath ?? null,
  confidence: receipt.confidence,
  status: receipt.status,
  created_at: receipt.createdAt,
  updated_at: receipt.updatedAt ?? null,
  notes: receipt.notes,
  synced_at: receipt.syncedAt ?? null
})

const fromRow = (row: ReceiptRow): Receipt => ({
  id: row.id,
  eInvoiceId: row.e_invoice_id,
  companyName: row.company_name,
  address: row.address,
  date: row.date,
  totalAmount: row.total_amount,
  taxAmount: row.tax_amount,
  currency: row.currency,
  paymentMethod: row.payment_method,
  paymentLast4: row.payment_last4,
  category: row.category as ReceiptCategory,
  imageUri: row.image_uri,
  cloudPath: row.cloud_path,
  confidence: row.confidence,
  status: row.status as ReceiptStatus,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  notes: row.notes,
  syncedAt: row.synced_at
})

export const upsertCloudReceipt = async (
  receipt: Receipt,
  userId: string
): Promise<{ error?: string }> => {
  if (!supabase) return {}
  const { error } = await supabase.from(TABLE).upsert(toRow(receipt, userId))
  return error ? { error: error.message } : {}
}

export const deleteCloudReceipt = async (
  id: string,
  userId: string
): Promise<{ error?: string }> => {
  if (!supabase) return {}
  const { error } = await supabase.from(TABLE).delete().eq('id', id).eq('user_id', userId)
  return error ? { error: error.message } : {}
}

export const fetchCloudReceipts = async (
  userId: string
): Promise<{ receipts: Receipt[]; error?: string }> => {
  if (!supabase) return { receipts: [] }
  const { data, error } = await supabase.from(TABLE).select('*').eq('user_id', userId)
  if (error) return { receipts: [], error: error.message }
  return { receipts: (data as ReceiptRow[]).map(fromRow) }
}

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export const uploadReceiptImage = async (
  localUri: string,
  userId: string,
  receiptId: string
): Promise<UploadResult> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { url: localUri, path: '', error: 'Supabase not configured.' }
  }
  try {
    const source = await (await fetch(localUri)).blob()
    const compressed = await compressImage(source, 1920, 0.8)
    const fileName = `${userId}/${receiptId}-${Date.now()}.jpg`

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(fileName, compressed, { contentType: 'image/jpeg', upsert: true })
    if (error) return { url: localUri, path: '', error: error.message }

    const {
      data: { publicUrl }
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path)
    return { url: publicUrl, path: data.path }
  } catch (err) {
    return {
      url: localUri,
      path: '',
      error: err instanceof Error ? err.message : 'Upload failed'
    }
  }
}

export const deleteReceiptImage = async (
  path: string
): Promise<{ success: boolean; error?: string }> => {
  if (!supabase || !path) return { success: true }
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path])
  return error ? { success: false, error: error.message } : { success: true }
}
