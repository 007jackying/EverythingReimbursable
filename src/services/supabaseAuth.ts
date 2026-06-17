import { supabase, isSupabaseConfigured } from '@/config/supabase'
import type { User } from '@/context/AuthContext'

export interface AuthResult {
  user: User | null
  error?: string
}

export const signUpWithEmail = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResult> => {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      user: { id: 'user-1', name, email },
      error: 'Supabase not configured. Using local auth.'
    }
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: name
        }
      }
    })

    if (error) {
      return { user: null, error: error.message }
    }

    if (!data.user) {
      return { user: null, error: 'User creation failed' }
    }

    const user: User = {
      id: data.user.id,
      name: data.user.user_metadata?.display_name || name,
      email: data.user.email || email
    }

    return { user }
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : 'Sign up failed' }
  }
}

export const signInWithEmail = async (email: string, password: string): Promise<AuthResult> => {
  if (!isSupabaseConfigured() || !supabase) {
    const localPart = email.split('@')[0]
    const cleanName = localPart.split('+')[0].replace(/[._]/g, ' ')
    const name = cleanName
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
    return {
      user: { id: 'user-1', name, email },
      error: 'Supabase not configured. Using local auth.'
    }
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return { user: null, error: error.message }
    }

    if (!data.user) {
      return { user: null, error: 'Sign in failed' }
    }

    const user: User = {
      id: data.user.id,
      name: data.user.user_metadata?.display_name || email.split('@')[0],
      email: data.user.email || email
    }

    return { user }
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : 'Sign in failed' }
  }
}

export const signOut = async (): Promise<{ error?: string }> => {
  if (!isSupabaseConfigured() || !supabase) {
    return {}
  }

  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return { error: error.message }
    }
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Sign out failed' }
  }
}

export const getCurrentSession = async (): Promise<{ user: User | null; error?: string }> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { user: null }
  }

  try {
    const {
      data: { session }
    } = await supabase.auth.getSession()

    if (!session?.user) {
      return { user: null }
    }

    const user: User = {
      id: session.user.id,
      name: session.user.user_metadata?.display_name || session.user.email?.split('@')[0] || 'User',
      email: session.user.email || ''
    }

    return { user }
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : 'Session check failed' }
  }
}

export const updateUserProfile = async (
  userId: string,
  name: string
): Promise<{ error?: string }> => {
  if (!isSupabaseConfigured() || !supabase) {
    return {}
  }

  try {
    const { error } = await supabase.auth.updateUser({
      data: {
        display_name: name
      }
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Update failed' }
  }
}

export const resetPassword = async (email: string): Promise<{ error?: string }> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase not configured. Password reset unavailable.' }
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'everythingreimbursable://reset-password'
    })

    if (error) {
      return { error: error.message }
    }

    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Password reset failed' }
  }
}

const mapSessionUser = (sessionUser: {
  id: string
  email?: string
  user_metadata?: Record<string, unknown>
}): User => ({
  id: sessionUser.id,
  name:
    (sessionUser.user_metadata?.display_name as string) ||
    sessionUser.email?.split('@')[0] ||
    'User',
  email: sessionUser.email || ''
})

// Keeps app auth state in step with Supabase (token refresh, revocation, recovery
// links). INITIAL_SESSION is ignored — startup restore is handled by getCurrentSession.
export const onAuthStateChange = (
  callback: (event: string, user: User | null) => void
): (() => void) => {
  if (!isSupabaseConfigured() || !supabase) {
    return () => {}
  }

  const {
    data: { subscription }
  } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'INITIAL_SESSION') return
    callback(event, session?.user ? mapSessionUser(session.user) : null)
  })

  return () => subscription.unsubscribe()
}

// Establishes a session from tokens delivered in a deep link (password recovery)
export const setSessionFromTokens = async (
  accessToken: string,
  refreshToken: string
): Promise<{ user: User | null; error?: string }> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { user: null, error: 'Supabase not configured.' }
  }

  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken
    })
    if (error) {
      return { user: null, error: error.message }
    }
    return { user: data.session?.user ? mapSessionUser(data.session.user) : null }
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : 'Session restore failed' }
  }
}

export const updatePassword = async (newPassword: string): Promise<{ error?: string }> => {
  if (!isSupabaseConfigured() || !supabase) {
    return { error: 'Supabase not configured.' }
  }

  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      return { error: error.message }
    }
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Password update failed' }
  }
}
