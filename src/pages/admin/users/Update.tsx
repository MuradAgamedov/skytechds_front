import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'

interface User {
  id?: number
  user_id?: number
  admin_id?: number
  name: string
  email: string
  role?: string
  roles?: string[]
  created_at: string
  updated_at: string
}

interface UpdateUserData {
  name: string
  email: string
  password?: string
  password_confirmation?: string
  role: string
}

export default function UserUpdate() {
  console.log('UserUpdate component loaded')
  
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  
  console.log('Route ID:', id)
  const [user, setUser] = useState<User | null>(null)
  const [formData, setFormData] = useState<UpdateUserData>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    role: ''
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [roles, setRoles] = useState<{id: number, name: string}[]>([])
  const [loadingRoles, setLoadingRoles] = useState(true)

  useEffect(() => {
    if (id) {
      fetchUser(id)
    }
    fetchRoles()
  }, [id])

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

  const fetchUser = async (userId: string) => {
    console.log('Fetching user with ID:', userId)
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      console.log('API URL:', `${apiUrl}/admin/admins/${userId}`)
      console.log('Token exists:', !!token)

      const response = await fetch(`${apiUrl}/admin/admins/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      console.log('Response status:', response.status)
      console.log('Response ok:', response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.log('Error response:', errorText)
        throw new Error(`Failed to fetch user: ${response.status} ${errorText}`)
      }

      const data = await response.json()
      const userData = data.data
      console.log('User data from API:', userData)
      console.log('User roles:', userData.roles)
      console.log('User role:', userData.role)
      
      setUser(userData)
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        password: '',
        password_confirmation: '',
        role: userData.roles && userData.roles.length > 0 ? userData.roles[0] : (userData.role || '')
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to load user'
      setErrorMessage(errorMsg)
      Swal.fire({
        title: 'Error!',
        text: errorMsg,
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    } finally {
      setLoading(false)
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

    // Validation only if password is provided
    if (formData.password && formData.password.length > 0) {
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
    }

    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      // Only include password if it's provided
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      }

      if (formData.password && formData.password.length > 0) {
        updateData.password = formData.password
        updateData.password_confirmation = formData.password_confirmation
      }

      console.log('Update form data being sent:', updateData)

      const response = await fetch(`${apiUrl}/admin/admins/${id}`, {
        method: 'PUT' /* or PATCH, depending on your API */,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update user')
      }

      await Swal.fire({
        title: 'Success!',
        text: 'User updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      navigate('/admin/admins')
    } catch (error) {
      console.error('Error updating user:', error)
      let message = 'Failed to update user'
      if (error instanceof Error) {
        message = error.message
      }
      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', color: '#f9fafb' }}>
        Loading user data...
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
          ID: {id}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ padding: '20px', color: '#f9fafb' }}>
        User not found.
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>
          ID: {id}
        </div>
        {errorMessage && (
          <div style={{ marginTop: '10px', color: '#ef4444', fontSize: '12px' }}>
            Error: {errorMessage}
          </div>
        )}
        <button
          onClick={() => navigate('/admin/admins')}
          style={{
            marginTop: '10px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Back to Users
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>
          Update User - ID: {id}
        </h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>
          Edit system administrator information
        </p>
      </div>

      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#374151', borderRadius: '4px' }}>
        <strong>Debug Info:</strong>
        <div>Component loaded: ✓</div>
        <div>ID: {id}</div>
        <div>Loading: {loading ? 'Yes' : 'No'}</div>
        <div>User exists: {user ? 'Yes' : 'No'}</div>
        {errorMessage && <div style={{ color: '#ef4444' }}>Error: {errorMessage}</div>}
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

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#f9fafb', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              New Password (optional)
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
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
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#6b7280' }}>
              Leave empty if you don't want to change the password
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              color: '#f9fafb', 
              fontSize: '14px', 
              fontWeight: '500' 
            }}>
              Confirm New Password
            </label>
            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm new password"
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
              {submitting ? 'Updating...' : 'Update User'}
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
