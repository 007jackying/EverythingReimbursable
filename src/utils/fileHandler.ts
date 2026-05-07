/* eslint-disable no-console */
import * as FileSystem from 'expo-file-system/legacy'

export const copyImageToCache = async (sourceUri: string): Promise<string> => {
  const fileName = `receipt_${Date.now()}.jpg`
  const cacheDir = FileSystem.cacheDirectory

  if (!cacheDir) {
    throw new Error('Cache directory not available')
  }

  const destUri = `${cacheDir}${fileName}`
  console.log('[FileHandler] Copying image from:', sourceUri)
  console.log('[FileHandler] Copying image to:', destUri)

  await FileSystem.copyAsync({ from: sourceUri, to: destUri })

  const info = await FileSystem.getInfoAsync(destUri)
  console.log('[FileHandler] Copied file info:', JSON.stringify(info))

  return destUri
}

export const fileExists = async (uri: string): Promise<boolean> => {
  try {
    const info = await FileSystem.getInfoAsync(uri)
    return info.exists
  } catch {
    return false
  }
}

export const getFileSize = async (uri: string): Promise<number | null> => {
  try {
    const info = await FileSystem.getInfoAsync(uri)
    if (info.exists && 'size' in info) {
      return info.size
    }
    return null
  } catch {
    return null
  }
}

export const readAsBase64 = (uri: string): Promise<string> =>
  FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64
  })
