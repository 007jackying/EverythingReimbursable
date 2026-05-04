import theme from '@/constants/theme'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { ReceiptsProvider, useReceipts } from '@/context/ReceiptsContext'
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts
} from '@expo-google-fonts/plus-jakarta-sans'
import { SpaceGrotesk_400Regular, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk'
import { Slot } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'

SplashScreen.preventAutoHideAsync()

// Inner component — awaits fonts, auth rehydration, and receipts rehydration
const AppContent = ({ fontsLoaded }: { fontsLoaded: boolean }) => {
  const { isLoading: authLoading } = useAuth()
  const { isLoading: receiptsLoading } = useReceipts()
  const ready = fontsLoaded && !authLoading && !receiptsLoading

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync()
    }
  }, [ready])

  if (!ready) {
    return <View style={styles.splash} />
  }

  return (
    <View style={styles.root}>
      {/* eslint-disable-next-line react/style-prop-object */}
      <StatusBar style="dark" backgroundColor={theme.colors.background} />
      <Slot />
    </View>
  )
}

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold
  })

  return (
    <AuthProvider>
      <ReceiptsProvider>
        <AppContent fontsLoaded={fontsLoaded ?? false} />
      </ReceiptsProvider>
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  root: {
    flex: 1,
    backgroundColor: theme.colors.background
  }
})

export default RootLayout
