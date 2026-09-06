import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ecart_user')
      return savedUser ? JSON.parse(savedUser) : null
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => localStorage.getItem('ecart_token') || null)
  const [loading, setLoading] = useState(false)
  const [initializing, setInitializing] = useState(true)

  const setAuthData = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('ecart_user', JSON.stringify(userData))
    localStorage.setItem('ecart_token', authToken)
  }

  const clearAuthData = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('ecart_user')
    localStorage.removeItem('ecart_token')
  }

  // Restore & verify session on app mount
  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('ecart_token')
      if (!savedToken) {
        setInitializing(false)
        return
      }

      try {
        const res = await api.get('/auth/profile')
        if (res.data?.user) {
          setUser(res.data.user)
          localStorage.setItem('ecart_user', JSON.stringify(res.data.user))
        }
      } catch (err) {
        // If 401 Unauthorized or invalid token, clean up
        if (err.response?.status === 401) {
          clearAuthData()
        }
      } finally {
        setInitializing(false)
      }
    }

    restoreSession()
  }, [])

  // Real Login Flow via Laravel 11 / Supabase PostgreSQL
  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      if (res.data?.token && res.data?.user) {
        setAuthData(res.data.user, res.data.token)
        return { success: true, user: res.data.user }
      }
      return { success: false, error: 'Unexpected response from server.' }
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      let errorMsg = err.response?.data?.message
      if (apiErrors) {
        const firstField = Object.keys(apiErrors)[0]
        if (firstField && apiErrors[firstField]?.length > 0) {
          errorMsg = apiErrors[firstField][0]
        }
      }
      return {
        success: false,
        error: errorMsg || 'Unable to connect to the authentication server. Please check that the API is running.',
      }
    } finally {
      setLoading(false)
    }
  }

  // Real Register Flow
  const register = async (name, email, password, password_confirmation) => {
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        name,
        email,
        password,
        password_confirmation,
      })
      if (res.data?.token && res.data?.user) {
        setAuthData(res.data.user, res.data.token)
        return { success: true, user: res.data.user }
      }
      return { success: false, error: 'Registration succeeded but no session was returned.' }
    } catch (err) {
      const apiErrors = err.response?.data?.errors
      let errorMsg = err.response?.data?.message
      if (apiErrors) {
        const firstField = Object.keys(apiErrors)[0]
        if (firstField && apiErrors[firstField]?.length > 0) {
          errorMsg = apiErrors[firstField][0]
        }
      }
      return {
        success: false,
        error: errorMsg || 'Registration failed. Please check your details and try again.',
      }
    } finally {
      setLoading(false)
    }
  }

  // Demo Login: Calls real backend with seeded demo credentials
  const demoLogin = async (role = 'customer') => {
    const creds = role === 'admin'
      ? { email: 'admin@ecart.test', password: 'password' }
      : { email: 'customer@ecart.test', password: 'password' }

    return await login(creds.email, creds.password)
  }

  // Real Logout Flow (Instant 0ms local logout + background server revocation)
  const logout = async () => {
    const currentToken = localStorage.getItem('ecart_token')

    // 1. Immediate local session reset (0ms UI feedback - no waiting)
    clearAuthData()

    // 2. Background server-side token revocation
    if (currentToken) {
      try {
        await api.post(
          '/auth/logout',
          {},
          {
            headers: { Authorization: `Bearer ${currentToken}` },
          }
        )
      } catch {
        // ignore background network errors
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        loading,
        initializing,
        login,
        register,
        demoLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
