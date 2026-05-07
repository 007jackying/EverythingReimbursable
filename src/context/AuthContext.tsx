import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { secureDelete, secureGet, secureSet } from '@/utils/secureStorage'
import { STORAGE_KEYS } from '@/constants/app'

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
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const restore = async () => {
      try {
        const stored = await secureGet(USER_KEY)
        if (stored) {
          setUser(JSON.parse(stored) as User)
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const login = useCallback(async (email: string, _password: string) => {
    // Extract name from email: john.doe+alias@gmail.com -> John Doe
    const localPart = email.split('@')[0]
    // Remove everything after + and replace dots/underscores with spaces
    const cleanName = localPart.split('+')[0].replace(/[._]/g, ' ')
    // Capitalize each word
    const name = cleanName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
    await persist({ id: 'user-1', name, email })
  }, [])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signUp = useCallback(async (name: string, email: string, _password: string) => {
    await persist({ id: 'user-1', name, email })
  }, [])

  const logout = useCallback(async () => {
    await secureDelete(USER_KEY)
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
