import * as FileSystem from 'expo-file-system/legacy'

export const copyImageToCache = async (sourceUri: string): Promise<string> => {
  const fileName = `receipt_${Date.now()}.jpg`
  const cacheDir = FileSystem.cacheDirectory

  if (!cacheDir) {
    throw new Error('Cache directory not available')
  }

  const destUri = `${cacheDir}${fileName}`
  await FileSystem.copyAsync({ from: sourceUri, to: destUri })

  return destUri
}
