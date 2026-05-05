import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { secureGet, secureSet, secureDelete } from '@/utils/secureStorage'
import { GOOGLE_CONFIG } from '@/config/google'

WebBrowser.maybeCompleteAuthSession()

interface GoogleUser {
  email: string
  name: string
  picture?: string
}

interface GoogleContextType {
  accessToken: string | null
  refreshToken: string | null
  user: GoogleUser | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  refreshAccessToken: () => Promise<string | null>
}

const GoogleContext = createContext<GoogleContextType | undefined>(undefined)

const TOKEN_KEY = 'google_tokens'
const USER_KEY = 'google_user'

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke'
}

export const GoogleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'everythingreimbursable',
    path: 'oauth-callback',
    preferLocalhost: Platform.OS === 'web'
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: GOOGLE_CONFIG.clientId,
      scopes: GOOGLE_CONFIG.scopes,
      redirectUri,
      usePKCE: true
    },
    discovery
  )

  const fetchUserInfo = async (token: string): Promise<GoogleUser | null> => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) return null
      const data = await res.json()
      return {
        email: data.email,
        name: data.name,
        picture: data.picture
      }
    } catch {
      return null
    }
  }

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (!refreshToken) return null

    try {
      const res = await fetch(discovery.tokenEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: GOOGLE_CONFIG.clientId,
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        }).toString()
      })

      if (!res.ok) return null

      const data = await res.json()
      const newAccessToken = data.access_token
      const newRefreshToken = data.refresh_token || refreshToken

      setAccessToken(newAccessToken)
      setRefreshToken(newRefreshToken)

      await secureSet(
        TOKEN_KEY,
        JSON.stringify({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        })
      )

      return newAccessToken
    } catch {
      return null
    }
  }, [refreshToken])

  const signIn = async () => {
    try {
      const result = await promptAsync()

      if (result.type === 'success' && result.authentication) {
        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = result.authentication

        setAccessToken(newAccessToken || null)
        setRefreshToken(newRefreshToken || null)

        if (newAccessToken && newRefreshToken) {
          await secureSet(
            TOKEN_KEY,
            JSON.stringify({
              accessToken: newAccessToken,
              refreshToken: newRefreshToken
            })
          )
        }

        const userInfo = await fetchUserInfo(newAccessToken || '')
        if (userInfo) {
          setUser(userInfo)
          await secureSet(USER_KEY, JSON.stringify(userInfo))
        }
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
    }
  }

  const signOut = async () => {
    setAccessToken(null)
    setRefreshToken(null)
    setUser(null)
    await secureDelete(TOKEN_KEY)
    await secureDelete(USER_KEY)
  }

  useEffect(() => {
    const loadTokens = async () => {
      try {
        const tokensStr = await secureGet(TOKEN_KEY)
        const userStr = await secureGet(USER_KEY)

        if (tokensStr) {
          const tokens = JSON.parse(tokensStr)
          setAccessToken(tokens.accessToken)
          setRefreshToken(tokens.refreshToken)
        }

        if (userStr) {
          setUser(JSON.parse(userStr))
        }
      } catch (error) {
        console.error('Error loading Google tokens:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTokens()
  }, [])

  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.authentication

      setAccessToken(newAccessToken || null)
      setRefreshToken(newRefreshToken || null)

      if (newAccessToken && newRefreshToken) {
        secureSet(
          TOKEN_KEY,
          JSON.stringify({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
          })
        )
      }

      fetchUserInfo(newAccessToken || '').then((userInfo) => {
        if (userInfo) {
          setUser(userInfo)
          secureSet(USER_KEY, JSON.stringify(userInfo))
        }
      })
    }
  }, [response])

  return (
    <GoogleContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        isAuthenticated: !!accessToken,
        isLoading,
        signIn,
        signOut,
        refreshAccessToken
      }}
    >
      {children}
    </GoogleContext.Provider>
  )
}

export const useGoogle = () => {
  const context = useContext(GoogleContext)
  if (!context) {
    throw new Error('useGoogle must be used within a GoogleProvider')
  }
  return context
}
