import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { secureDelete, secureGet, secureSet } from '@/utils/secureStorage'
import { STORAGE_KEYS } from '@/constants/app'
import {
  signUpWithEmail,
  signInWithEmail,
  signOut,
  getCurrentSession,
  onAuthStateChange,
  updateUserProfile
} from '@/services/supabaseAuth'

const USER_KEY = STORAGE_KEYS.authUser

export interface User {
  id: string
  name: string
  email: string
}

interface AuthContextValue {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  updateName: (name: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const restore = async () => {
      try {
        const sessionResult = await getCurrentSession()
        if (sessionResult.user) {
          setUser(sessionResult.user)
          await secureSet(USER_KEY, JSON.stringify(sessionResult.user))
        } else {
          const stored = await secureGet(USER_KEY)
          if (stored) {
            setUser(JSON.parse(stored) as User)
          }
        }
      } catch {
        await secureDelete(USER_KEY)
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const persist = async (u: User) => {
    await secureSet(USER_KEY, JSON.stringify(u))
    setUser(u)
  }

  // Track Supabase session changes (token refresh, revocation, recovery links)
  useEffect(() => {
    const unsubscribe = onAuthStateChange((event, sessionUser) => {
      if (event === 'SIGNED_OUT') {
        secureDelete(USER_KEY)
        setUser(null)
      } else if (sessionUser) {
        persist(sessionUser)
      }
    })
    return unsubscribe
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const result = await signInWithEmail(email, password)
    if (result.error && !result.user) {
      throw new Error(result.error)
    }
    if (result.user) {
      await persist(result.user)
    }
  }, [])

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const result = await signUpWithEmail(name, email, password)
    if (result.error && !result.user) {
      throw new Error(result.error)
    }
    if (result.user) {
      await persist(result.user)
    }
  }, [])

  const logout = useCallback(async () => {
    await signOut()
    await secureDelete(USER_KEY)
    setUser(null)
  }, [])

  const updateName = useCallback(
    async (name: string) => {
      if (!user) return
      const result = await updateUserProfile(user.id, name)
      if (result.error) {
        console.warn('Profile update warning:', result.error)
      }
      await persist({ ...user, name })
    },
    [user]
  )

  const resetPassword = useCallback(async (email: string) => {
    const { resetPassword: resetPwd } = await import('@/services/supabaseAuth')
    const result = await resetPwd(email)
    if (result.error) {
      throw new Error(result.error)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: user !== null,
      isLoading,
      login,
      signUp,
      logout,
      updateName,
      resetPassword
    }),
    [user, isLoading, login, signUp, logout, updateName, resetPassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
