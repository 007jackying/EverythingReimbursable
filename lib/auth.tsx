'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from './supabase'
import { STORAGE_KEYS } from './types'

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
  updatePassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const USER_KEY = STORAGE_KEYS.authUser

const readStoredUser = (): User | null => {
  try {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? (JSON.parse(stored) as User) : null
  } catch {
    return null
  }
}

const storeUser = (user: User | null) => {
  try {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_KEY)
  } catch {
    // Ignore storage errors
  }
}

type SessionUser = { id: string; email?: string; user_metadata?: Record<string, unknown> }

const mapSessionUser = (sessionUser: SessionUser): User => ({
  id: sessionUser.id,
  name:
    (sessionUser.user_metadata?.display_name as string) ||
    sessionUser.email?.split('@')[0] ||
    'User',
  email: sessionUser.email || ''
})

// Local-only fallback when Supabase isn't configured — derive a display name from the email
const localUser = (email: string, name?: string): User => ({
  id: 'user-1',
  name:
    name ||
    email
      .split('@')[0]
      .split('+')[0]
      .replace(/[._]/g, ' ')
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' '),
  email
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const persist = useCallback((u: User) => {
    storeUser(u)
    setUser(u)
  }, [])

  useEffect(() => {
    const restore = async () => {
      try {
        if (supabase) {
          const {
            data: { session }
          } = await supabase.auth.getSession()
          if (session?.user) {
            const mapped = mapSessionUser(session.user)
            storeUser(mapped)
            setUser(mapped)
            return
          }
        }
        setUser(readStoredUser())
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  // Track Supabase session changes (token refresh, revocation, recovery links)
  useEffect(() => {
    if (!supabase) return undefined
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION') return
      if (event === 'SIGNED_OUT') {
        storeUser(null)
        setUser(null)
      } else if (session?.user) {
        persist(mapSessionUser(session.user))
      }
    })
    return () => subscription.unsubscribe()
  }, [persist])

  const login = useCallback(
    async (email: string, password: string) => {
      if (!supabase) {
        persist(localUser(email))
        return
      }
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw new Error(error.message)
      if (!data.user) throw new Error('Sign in failed')
      persist(mapSessionUser(data.user))
    },
    [persist]
  )

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      if (!supabase) {
        persist(localUser(email, name))
        return
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: name } }
      })
      if (error) throw new Error(error.message)
      if (!data.user) throw new Error('User creation failed')
      persist({ id: data.user.id, name, email: data.user.email || email })
    },
    [persist]
  )

  const logout = useCallback(async () => {
    if (supabase) await supabase.auth.signOut()
    storeUser(null)
    setUser(null)
  }, [])

  const updateName = useCallback(
    async (name: string) => {
      if (!user) return
      if (supabase) {
        const { error } = await supabase.auth.updateUser({ data: { display_name: name } })
        if (error) console.warn('Profile update warning:', error.message)
      }
      persist({ ...user, name })
    },
    [user, persist]
  )

  const resetPassword = useCallback(async (email: string) => {
    if (!supabase) throw new Error('Supabase not configured. Password reset unavailable.')
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    if (error) throw new Error(error.message)
  }, [])

  const updatePassword = useCallback(async (newPassword: string) => {
    if (!supabase) throw new Error('Supabase not configured.')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw new Error(error.message)
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
      resetPassword,
      updatePassword
    }),
    [user, isLoading, login, signUp, logout, updateName, resetPassword, updatePassword]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
