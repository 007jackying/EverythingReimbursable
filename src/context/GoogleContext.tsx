/* eslint-disable no-console */
import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { Platform } from 'react-native'
import { secureGet, secureSet, secureDelete } from '@/utils/secureStorage'
import { STORAGE_KEYS } from '@/constants/app'

interface GoogleUser {
  email: string
  name: string
  picture?: string
}

interface GoogleContextType {
  accessToken: string | null
  user: GoogleUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  refreshTokens: () => Promise<string | null>
}

const GoogleContext = createContext<GoogleContextType | undefined>(undefined)

const TOKEN_KEY = STORAGE_KEYS.googleToken
const USER_KEY = STORAGE_KEYS.googleUser

const isGoogleAvailable = Platform.OS === 'android' || Platform.OS === 'ios'

export const GoogleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Restore persisted session on mount
  useEffect(() => {
    const restore = async () => {
      console.log('[Google] Restoring session from storage...')
      try {
        const [tokenStr, userStr] = await Promise.all([secureGet(TOKEN_KEY), secureGet(USER_KEY)])
        if (tokenStr && userStr) {
          console.log('[Google] Found stored token and user')
          setAccessToken(tokenStr)
          setUser(JSON.parse(userStr))
        } else {
          console.log('[Google] No stored session found')
        }
      } catch (error) {
        console.error('[Google] Failed to restore session:', error)
        await Promise.all([secureDelete(TOKEN_KEY), secureDelete(USER_KEY)])
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const signIn = useCallback(async () => {
    if (!isGoogleAvailable) {
      console.warn('[Google] Sign-In is only available on Android and iOS')
      return
    }

    console.log('[Google] Starting sign-in flow...')
    try {
      const GoogleSigninLib = await import('@react-native-google-signin/google-signin')
      const { GoogleSignin, isSuccessResponse } = GoogleSigninLib

      const { GOOGLE_CONFIG } = await import('@/config/google')

      console.log(
        '[Google] Configuring with web client ID:',
        `${GOOGLE_CONFIG.webClientId?.substring(0, 20)}...`
      )
      console.log('[Google] Scopes:', GOOGLE_CONFIG.scopes)

      GoogleSignin.configure({
        webClientId: GOOGLE_CONFIG.webClientId,
        iosClientId: GOOGLE_CONFIG.iosClientId,
        scopes: GOOGLE_CONFIG.scopes,
        offlineAccess: false
      })

      console.log('[Google] Checking play services...')
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })

      console.log('[Google] Prompting user for sign-in...')
      const response = await GoogleSignin.signIn()

      if (!isSuccessResponse(response)) {
        console.log('[Google] Sign-in was not successful (user cancelled?)')
        return
      }

      const { user: userInfo } = response.data
      console.log('[Google] Sign-in successful for:', userInfo.email)

      console.log('[Google] Getting access token...')
      const tokens = await GoogleSignin.getTokens()
      const token = tokens.accessToken
      console.log('[Google] Access token received:', `${token?.substring(0, 20)}...`)

      const googleUser: GoogleUser = {
        email: userInfo.email,
        name: userInfo.name ?? userInfo.email,
        picture: userInfo.photo ?? undefined
      }

      setAccessToken(token)
      setUser(googleUser)

      console.log('[Google] Persisting session to storage...')
      await Promise.all([
        secureSet(TOKEN_KEY, token),
        secureSet(USER_KEY, JSON.stringify(googleUser))
      ])

      console.log('[Google] Sign-in complete!')
    } catch (error: unknown) {
      const GoogleSigninLib = await import('@react-native-google-signin/google-signin')
      const { statusCodes, isErrorWithCode } = GoogleSigninLib

      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log('[Google] User cancelled sign-in')
          return
        }
        if (error.code === statusCodes.IN_PROGRESS) {
          console.log('[Google] Sign-in already in progress')
          return
        }
        if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          console.error('[Google] Play Services not available')
          return
        }
      }
      console.error('[Google] Sign-in error:', error)
      throw error
    }
  }, [])

  const signOut = useCallback(async () => {
    console.log('[Google] Signing out...')
    if (isGoogleAvailable) {
      try {
        const { GoogleSignin } = await import('@react-native-google-signin/google-signin')
        await GoogleSignin.signOut()
        console.log('[Google] Native sign-out complete')
      } catch (error) {
        console.log('[Google] Native sign-out error (ignored):', error)
      }
    }
    setAccessToken(null)
    setUser(null)
    await Promise.all([secureDelete(TOKEN_KEY), secureDelete(USER_KEY)])
    console.log('[Google] Session cleared')
  }, [])

  const refreshTokens = useCallback(async (): Promise<string | null> => {
    if (!isGoogleAvailable) {
      console.warn('[Google] Token refresh only available on Android and iOS')
      return null
    }

    console.log('[Google] Refreshing tokens...')
    try {
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin')
      const tokens = await GoogleSignin.getTokens()
      const newToken = tokens.accessToken
      console.log('[Google] New access token:', `${newToken?.substring(0, 20)}...`)

      setAccessToken(newToken)
      await secureSet(TOKEN_KEY, newToken)

      return newToken
    } catch (error) {
      console.error('[Google] Token refresh failed:', error)
      await signOut()
      return null
    }
  }, [signOut])

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: !!accessToken,
      isLoading,
      signIn,
      signOut,
      refreshTokens
    }),
    [accessToken, user, isLoading, signIn, signOut, refreshTokens]
  )

  return <GoogleContext.Provider value={value}>{children}</GoogleContext.Provider>
}

export const useGoogle = () => {
  const context = useContext(GoogleContext)
  if (!context) throw new Error('useGoogle must be used within a GoogleProvider')
  return context
}
