import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface Permission {
  id: number
  name: string
  created_at: string
  updated_at: string
}

export default function PermissionsIndex() {
  const navigate = useNavigate()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPermissions()
  }, [])

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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load permissions'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'You won\'t be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    })

    if (!result.isConfirmed) return

    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/permissions/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete permission')
      }

      await Swal.fire({
        title: 'Deleted!',
        text: 'Permission has been deleted.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      fetchPermissions()
    } catch (error) {
      console.error('Error deleting permission:', error)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete permission.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', color: '#f9fafb' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Permissions</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage system permissions</p>
        </div>
        <button
          onClick={() => navigate('/admin/permissions/create')}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            backgroundColor: '#3b82f6',
            color: '#f9fafb',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={16} />
          Add Permission
        </button>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#374151' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Created At</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {permissions.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    No permissions found.
                  </td>
                </tr>
              ) : (
                permissions.map((permission) => (
                  <tr key={permission.id} style={{ borderBottom: '1px solid #374151' }}>
                    <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>{permission.id}</td>
                    <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>
                      {permission.name}
                    </td>
                    <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>
                      {new Date(permission.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => navigate(`/admin/permissions/${permission.id}/edit`)}
                          style={{
                            padding: '6px 8px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            backgroundColor: '#3b82f6',
                            color: '#f9fafb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDelete(permission.id)}
                          style={{
                            padding: '6px 8px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            backgroundColor: '#ef4444',
                            color: '#f9fafb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
