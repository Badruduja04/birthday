import { supabase } from '../supabase/client'

export interface LoginCredentials {
  username: string
  birthday: string
}

export interface AuthResult {
  success: boolean
  error?: string
  user?: any
}

/**
 * Login dengan username dan birthday
 * Validasi dengan data di tabel profiles
 */
export async function loginWithUsernameAndBirthday(
  credentials: LoginCredentials
): Promise<AuthResult> {
  try {
    const { username, birthday } = credentials

    // Format birthday to YYYY-MM-DD for comparison
    const formattedBirthday = birthday.includes('T') 
      ? birthday.split('T')[0] 
      : birthday

    console.log('Login attempt:', { username, birthday: formattedBirthday })

    // Query profiles table untuk cari user dengan username dan birthday yang match
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username.toLowerCase().trim())
      .eq('birthday', formattedBirthday)

    console.log('Query result:', { profiles, profileError })

    // Check if we got data
    if (profileError) {
      console.error('Supabase error:', profileError)
      return {
        success: false,
        error: `Database error: ${profileError.message}`
      }
    }

    if (!profiles || profiles.length === 0) {
      console.error('Profile not found')
      return {
        success: false,
        error: 'Username or birthday is incorrect'
      }
    }

    const profile = profiles[0]

    // Simpan session di localStorage (simple session management)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user_session', JSON.stringify({
        id: profile.id,
        username: profile.username,
        display_name: profile.display_name,
        avatar_url: profile.avatar_url,
        birthday: profile.birthday
      }))
    }

    return {
      success: true,
      user: profile
    }
  } catch (error) {
    console.error('Login error:', error)
    return {
      success: false,
      error: 'An error occurred during login'
    }
  }
}

/**
 * Logout user
 */
export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user_session')
  }
}

/**
 * Get current user session
 */
export function getCurrentUser() {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('user_session')
    if (session) {
      return JSON.parse(session)
    }
  }
  return null
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null
}
