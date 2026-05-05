import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const isWeb = Platform.OS === 'web'

const webStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Ignore storage errors
    }
  },
  deleteItem: (key: string): void => {
    try {
      localStorage.removeItem(key)
    } catch {
      // Ignore storage errors
    }
  }
}

export const secureGet = async (key: string): Promise<string | null> => {
  if (isWeb) {
    return webStorage.getItem(key)
  }
  try {
    return await SecureStore.getItemAsync(key)
  } catch {
    return null
  }
}

export const secureSet = async (key: string, value: string): Promise<void> => {
  if (isWeb) {
    webStorage.setItem(key, value)
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
    webStorage.deleteItem(key)
    return
  }
  try {
    await SecureStore.deleteItemAsync(key)
  } catch {
    // Ignore storage errors
  }
}
