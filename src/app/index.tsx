import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '@/constants/app'
import { useAuth } from '@/context/AuthContext'
import { Redirect } from 'expo-router'
import { useEffect, useState } from 'react'

const Index = () => {
  const { isAuthenticated } = useAuth()
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEYS.hasOnboarded)
      .then((value) => setHasOnboarded(value === 'true'))
      .catch(() => setHasOnboarded(false))
  }, [])

  if (isAuthenticated) return <Redirect href="/(main)/home" />
  // Splash gate in _layout keeps the native splash up while this resolves
  if (hasOnboarded === null) return null
  return <Redirect href={hasOnboarded ? '/(auth)/login' : '/(auth)/splash'} />
}

export default Index
