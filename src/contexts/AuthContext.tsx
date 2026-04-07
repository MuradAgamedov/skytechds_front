import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  name: string
  email: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA: boolean; userId?: number; message?: string }>
  verify2FA: (userId: number, code: string) => Promise<boolean>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isLoading: boolean
  requires2FA: boolean
  pendingUserId: number | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [requires2FA, setRequires2FA] = useState(false)
  const [pendingUserId, setPendingUserId] = useState<number | null>(null)

  useEffect(() => {
    // Check for existing auth data on mount
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user_data')
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setToken(storedToken)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing stored user data:', error)
        // Clear invalid data
        localStorage.removeItem('auth_token')
        localStorage.removeItem('user_data')
      }
    }
    
    // Always set loading to false after checking localStorage
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; requires2FA: boolean; userId?: number; message?: string }> => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const response = await fetch(`${apiUrl}/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Check if 2FA is required
        if (data.data.requires_2fa) {
          setRequires2FA(true)
          setPendingUserId(data.data.user_id)
          return {
            success: true,
            requires2FA: true,
            userId: data.data.user_id,
            message: data.data.message
          }
        } else {
          // Direct login (no 2FA)
          setToken(data.data.token)
          setUser(data.data.user)
          localStorage.setItem('auth_token', data.data.token)
          localStorage.setItem('user_data', JSON.stringify(data.data.user))
          return {
            success: true,
            requires2FA: false
          }
        }
      } else {
        return {
          success: false,
          requires2FA: false
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        requires2FA: false
      }
    }
  }

  const verify2FA = async (userId: number, code: string): Promise<boolean> => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const response = await fetch(`${apiUrl}/admin/verify-2fa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, code }),
      })

      const data = await response.json()

      if (data.success) {
        setToken(data.data.token)
        setUser(data.data.user)
        localStorage.setItem('auth_token', data.data.token)
        localStorage.setItem('user_data', JSON.stringify(data.data.user))
        
        // Reset 2FA state
        setRequires2FA(false)
        setPendingUserId(null)
        
        return true
      } else {
        return false
      }
    } catch (error) {
      console.error('2FA verification error:', error)
      return false
    }
  }

  const logout = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      if (token) {
        // Call logout API
        await fetch(`${apiUrl}/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      }
    } catch (error) {
      console.error('Logout API error:', error)
    } finally {
      // Always clear local data regardless of API call success
      setUser(null)
      setToken(null)
      setRequires2FA(false)
      setPendingUserId(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
    }
  }

  const isAuthenticated = !!token && !!user

  const value: AuthContextType = {
    user,
    token,
    login,
    verify2FA,
    logout,
    isAuthenticated,
    isLoading,
    requires2FA,
    pendingUserId
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
