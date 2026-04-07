import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'

interface Role {
  id: number
  name: string
  permissions: string[]
  created_at: string
  updated_at: string
}

interface Permission {
  id: number
  name: string
}

export default function RoleUpdate() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchRole()
    fetchPermissions()
  }, [id])

  const fetchRole = async () => {
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/roles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch role')
      }

      const data = await response.json()
      const roleData = data.data
      setRole(roleData)
      setName(roleData.name)
      setSelectedPermissions(roleData.permissions || [])
    } catch (error) {
      console.error('Error fetching role:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load role'
      })
      navigate('/admin/roles')
    }
  }

  const fetchPermissions = async () => {
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch permissions')
      }

      const data = await response.json()
      setPermissions(data.data || [])
    } catch (error) {
      console.error('Error fetching permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePermissionToggle = (permissionName: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionName)
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSubmitting(true)

    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/admin/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name,
          permissions: selectedPermissions 
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update role')
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Role updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      navigate('/admin/roles')
    } catch (error) {
      console.error('Error updating role:', error)
      let message = 'Failed to update role'
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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Update Role</h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Edit system role</p>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#f9fafb', fontSize: '14px', fontWeight: '500' }}>
              Role Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter role name"
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
            <label style={{ display: 'block', marginBottom: '8px', color: '#f9fafb', fontSize: '14px', fontWeight: '500' }}>
              Permissions
            </label>
            <div style={{
              backgroundColor: '#374151',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              padding: '12px',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {permissions.length === 0 ? (
                <div style={{ color: '#6b7280', fontSize: '14px' }}>No permissions available</div>
              ) : (
                permissions.map((permission) => (
                  <div key={permission.id} style={{ marginBottom: '8px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: '#f9fafb',
                      fontSize: '14px'
                    }}>
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.name)}
                        onChange={() => handlePermissionToggle(permission.name)}
                        style={{
                          width: '16px',
                          height: '16px',
                          accentColor: '#3b82f6'
                        }}
                      />
                      {permission.name}
                    </label>
                  </div>
                ))
              )}
            </div>
            {selectedPermissions.length > 0 && (
              <div style={{ marginTop: '8px', fontSize: '12px', color: '#6b7280' }}>
                {selectedPermissions.length} permission(s) selected
              </div>
            )}
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
              {submitting ? 'Updating...' : 'Update Role'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin/roles')}
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
