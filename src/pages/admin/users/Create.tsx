import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

interface CreateUserData {
  name: string
  email: string
  password: string
  password_confirmation: string
  role: string
}

export default function UserCreate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [roles, setRoles] = useState<{id: number, name: string}[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/roles`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch roles')
      }

      const data = await response.json()
      setRoles(data.data || [])
    } catch (error) {
      console.error('Error fetching roles:', error)
    } finally {
      setLoadingRoles(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSubmitting(true)

    // Validation
    if (formData.password !== formData.password_confirmation) {
      setErrorMessage('Passwords do not match')
      setSubmitting(false)
      return
    }

    if (formData.password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long')
      setSubmitting(false)
      return
    }

    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      console.log('Form data being sent:', formData)
      
      const response = await fetch(`${apiUrl}/admin/admins`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create user')
      }

      await Swal.fire({
        title: 'Success!',
        text: 'User created successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      navigate('/admin/admins')
    } catch (error) {
      console.error('Error creating user:', error)
      let message = 'Failed to create user'
      if (error instanceof Error) {
        message = error.message
      }
      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>
          Create User
        </h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
          Add new system administrator
        </p>
      </div>

      <div style={{ 
        maxWidth: '600px',
        backgroundColor: '#1f2937', 
        borderRadius: '8px', 
        border: '1px solid #374151', 
        padding: '24px' 
      }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#f9fafb', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter full name"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: '#f9fafb',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#4b5563'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#f9fafb', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: '#f9fafb',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#4b5563'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#f9fafb', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min. 8 characters)"
              required
              minLength={8}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: '#f9fafb',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#4b5563'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#f9fafb', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm password"
              required
              minLength={8}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: '#f9fafb',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#4b5563'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#f9fafb', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              disabled={loadingRoles}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: '#f9fafb',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#4b5563'}
            >
              <option value="">
                {loadingRoles ? 'Loading roles...' : 'Select a role'}
              </option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {errorMessage && (
            <div style={{
              backgroundColor: '#ef4444',
              color: '#f9fafb',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer',
                backgroundColor: submitting ? '#6b7280' : '#3b82f6',
                color: '#f9fafb',
                transition: 'all 0.2s'
              }}
            >
              {submitting ? 'Creating...' : 'Create User'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin/admins')}
              style={{
                padding: '10px 20px',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: '#f9fafb',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
