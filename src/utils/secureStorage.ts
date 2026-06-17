import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const isWeb = Platform.OS === 'web'

export const secureGet = async (key: string): Promise<string | null> => {
  if (isWeb) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }
  try {
    return await SecureStore.getItemAsync(key)
  } catch {
    return null
  }
}

export const secureSet = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Ignore storage errors
    }
    return
  }
  try {
    await SecureStore.setItemAsync(key, value)
  } catch {
    // Ignore storage errors
  }
}

export const secureDelete = async (key: string): Promise<void> => {
  if (isWeb) {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore storage errors
    }
    return
  }
  try {
    await SecureStore.deleteItemAsync(key)
  } catch {
    // Ignore storage errors
  }
}
