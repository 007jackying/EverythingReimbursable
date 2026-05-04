import * as SecureStore from 'expo-secure-store'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const USER_KEY = 'auth_user'

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
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Rehydrate session on mount
  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await SecureStore.getItemAsync(USER_KEY)
        if (stored) {
          setUser(JSON.parse(stored) as User)
        }
      } catch {
        // Corrupt store — start fresh
        await SecureStore.deleteItemAsync(USER_KEY)
      } finally {
        setIsLoading(false)
      }
    }
    restore()
  }, [])

  const persist = async (u: User) => {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(u))
    setUser(u)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = useCallback(async (email: string, _password: string) => {
    // TODO: replace with real API call
    const raw = email.split('@')[0].replace(/[._]/g, ' ')
    const name = raw.charAt(0).toUpperCase() + raw.slice(1)
    await persist({ id: 'user-1', name, email })
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signUp = useCallback(async (name: string, email: string, _password: string) => {
    // TODO: replace with real API call
    await persist({ id: 'user-1', name, email })
  }, [])

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(USER_KEY)
    setUser(null)
  }, [])

  const updateName = useCallback(
    async (name: string) => {
      if (!user) return
      await persist({ ...user, name })
    },
    [user]
  )

  const value = useMemo(
    () => ({ user, isAuthenticated: user !== null, isLoading, login, signUp, logout, updateName }),
    [user, isLoading, login, signUp, logout, updateName]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
