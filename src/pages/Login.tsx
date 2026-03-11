import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.js'

export default function Login() {
  const navigate = useNavigate()
  const { login, verify2FA, requires2FA, pendingUserId } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const result = await login(formData.email, formData.password)
      
      if (result.success) {
        if (result.requires2FA) {
          setMessage(result.message || 'Two factor code sent to your email')
        } else {
          console.log('Login successful')
          navigate('/')
        }
      } else {
        setError('Login failed')
      }
    } catch (err) {
      setError('An error occurred during login')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const success = await verify2FA(pendingUserId!, formData.twoFactorCode)
      
      if (success) {
        console.log('2FA verification successful')
        navigate('/')
      } else {
        setError('Invalid or expired verification code')
      }
    } catch (err) {
      setError('An error occurred during 2FA verification')
      console.error('2FA error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#1f2937',
      padding: '20px'
    }}>
      <div style={{ 
        backgroundColor: '#374151', 
        padding: '40px', 
        borderRadius: '12px', 
        border: '1px solid #4b5563',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          marginBottom: '24px', 
          textAlign: 'center',
          color: '#f9fafb'
        }}>
          {requires2FA ? 'Two-Factor Authentication' : 'Admin Login'}
        </h1>

        {message && !requires2FA && (
          <div style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ 
            backgroundColor: '#ef4444', 
            color: 'white', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {!requires2FA ? (
          <form onSubmit={handleLoginSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontWeight: '500', 
                color: '#f9fafb' 
              }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#1f2937',
                  color: '#f9fafb',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your email"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontWeight: '500', 
                color: '#f9fafb' 
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#1f2937',
                  color: '#f9fafb',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#6b7280' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        ) : (
          <form onSubmit={handle2FASubmit}>
            <div style={{ marginBottom: '16px' }}>
              <p style={{ 
                color: '#9ca3af', 
                marginBottom: '16px', 
                textAlign: 'center',
                fontSize: '14px'
              }}>
                {message}
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '4px', 
                fontWeight: '500', 
                color: '#f9fafb' 
              }}>
                Verification Code
              </label>
              <input
                type="text"
                name="twoFactorCode"
                value={formData.twoFactorCode}
                onChange={handleChange}
                required
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #4b5563',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#1f2937',
                  color: '#f9fafb',
                  boxSizing: 'border-box',
                  textAlign: 'center',
                  letterSpacing: '2px'
                }}
                placeholder="Enter 6-digit code"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: loading ? '#6b7280' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.3s'
              }}
            >
              {loading ? 'Verifying...' : 'Verify Code'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
