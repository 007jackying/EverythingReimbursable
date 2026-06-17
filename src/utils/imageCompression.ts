import * as ImageManipulator from 'expo-image-manipulator'

export interface CompressionOptions {
  maxWidth?: number
  quality?: number
}

export const compressImage = async (
  uri: string,
  options: CompressionOptions = {}
): Promise<string> => {
  const { maxWidth = 1920, quality = 0.8 } = options

  // Resize by width only — passing both width and height stretches the image
  const result = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: maxWidth } }], {
    compress: quality,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: false
  })

  return result.uri
}

export const generateImageFileName = (userId: string, receiptId: string): string => {
  const timestamp = Date.now()
  return `${userId}/${receiptId}-${timestamp}.jpg`
}
