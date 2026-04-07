import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'

interface Permission {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export default function PermissionUpdate() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [permission, setPermission] = useState<Permission | null>(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchPermission()
  }, [id])

  const fetchPermission = async () => {
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/permissions/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch permission')
      }

      const data = await response.json()
      const permissionData = data.data
      setPermission(permissionData)
      setName(permissionData.name)
    } catch (error) {
      console.error('Error fetching permission:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load permission'
      })
      navigate('/admin/permissions')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSubmitting(true)

    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/admin/permissions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update permission')
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Permission updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      navigate('/admin/permissions')
    } catch (error) {
      console.error('Error updating permission:', error)
      let message = 'Failed to update permission'
      if (error instanceof Error) {
        message = error.message
      }
      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', color: '#f9fafb' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Update Permission</h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Edit system permission</p>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#f9fafb', fontSize: '14px', fontWeight: '500' }}>
              Permission Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter permission name"
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
              {submitting ? 'Updating...' : 'Update Permission'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin/permissions')}
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
