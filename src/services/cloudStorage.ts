import { supabase, STORAGE_BUCKET, isSupabaseConfigured } from '@/config/supabase'
import { compressImage, generateImageFileName } from '@/utils/imageCompression'
import { File } from 'expo-file-system'

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
    return {
      url: localUri,
      path: '',
      error: 'Supabase not configured. Using local storage.'
    }
  }

  try {
    const compressedUri = await compressImage(localUri, {
      maxWidth: 1920,
      quality: 0.8
    })

    const file = new File(compressedUri)
    const bytes = await file.bytes()

    const fileName = generateImageFileName(userId, receiptId)

    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(fileName, bytes, {
      contentType: 'image/jpeg',
      upsert: true
    })

    if (error) {
      console.error('Supabase upload error:', error)
      return {
        url: localUri,
        path: '',
        error: error.message
      }
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(data.path)

    return {
      url: publicUrl,
      path: data.path
    }
  } catch (err) {
    console.error('Upload failed:', err)
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
  if (!isSupabaseConfigured() || !supabase) {
    return { success: true }
  }

  if (!path) {
    return { success: true }
  }

  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path])

    if (error) {
      console.error('Delete error:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (err) {
    console.error('Delete failed:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Delete failed' }
  }
}
