import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { Edit, Trash2, Plus, Eye } from 'lucide-react'

interface Translation {
  id: number
  title: string
  seo_title: string
  seo_description: string
  seo_keywords: string
}

interface Page {
  id: number
  translations: Translation[]
  status: number
  order: number
  slug: string
}

interface StatusOption {
  id: number
  name: string
  color: string
}

export default function PagesIndex() {
  const [pages, setPages] = useState<Page[]>([])
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPages()
    fetchStatusOptions()
  }, [])

  const fetchStatusOptions = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/status-options`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStatusOptions(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching status options:', err)
      // Fallback to default status options
      setStatusOptions([
        { id: 1, name: 'Active', color: '#10b981' },
        { id: 2, name: 'Pending', color: '#f59e0b' },
        { id: 3, name: 'Inactive', color: '#ef4444' },
        { id: 4, name: 'Draft', color: '#6b7280' }
      ])
    }
  }

  const fetchPages = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/pages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch pages')
      }
      
      const data = await response.json()
      setPages(data.data || [])
    } catch (err) {
      console.error('Error fetching pages:', err)
      setError('Failed to load pages')
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
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/pages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete page')
      }
      
      await Swal.fire({
        title: 'Deleted!',
        text: 'Page has been deleted.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })
      
      fetchPages()
    } catch (err) {
      console.error('Error deleting page:', err)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete page',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const getStatusBadge = (status: number) => {
    const statusOption = statusOptions.find(option => option.id === status)
    
    if (!statusOption) {
      // Handle common boolean status values (0 and 1)
      if (status === 1) {
        return (
          <span style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            Active
          </span>
        )
      }
      
      if (status === 0) {
        return (
          <span style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '500'
          }}>
            Inactive
          </span>
        )
      }
      
      return (
        <span style={{
          backgroundColor: '#6b7280',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: '500'
        }}>
          Unknown
        </span>
      )
    }
    
    return (
      <span style={{
        backgroundColor: statusOption.color,
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500'
      }}>
        {statusOption.name}
      </span>
    )
  }

  const getTranslationValue = (translations: Translation[], field: keyof Translation) => {
    // Find the first non-null value for the field
    const translation = translations.find(t => t[field] !== null && t[field] !== '')
    return translation ? translation[field] : '—'
  }

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading pages...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Pages</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage website pages</p>
        </div>
        <button
          onClick={() => window.location.href = '/pages/create'}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={16} />
          Add Page
        </button>
      </div>

      {error && (
        <div style={{
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          {error}
        </div>
      )}

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#374151' }}>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#f9fafb', borderBottom: '1px solid #4b5563' }}>Title</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#f9fafb', borderBottom: '1px solid #4b5563' }}>Slug</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#f9fafb', borderBottom: '1px solid #4b5563' }}>Order</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#f9fafb', borderBottom: '1px solid #4b5563' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', fontSize: '14px', fontWeight: '500', color: '#f9fafb', borderBottom: '1px solid #4b5563' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id} style={{ borderBottom: '1px solid #374151' }}>
                <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>
                  {getTranslationValue(page.translations, 'title')}
                </td>
                <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>
                  {page.slug}
                </td>
                <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>
                  {page.order}
                </td>
                <td style={{ padding: '12px' }}>
                  {getStatusBadge(page.status)}
                </td>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => window.location.href = `/pages/${page.id}/edit`}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Edit"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(page.id)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {pages.length === 0 && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <div style={{ marginBottom: '16px' }}>No pages found</div>
            <button
              onClick={() => window.location.href = '/pages/create'}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              Create First Page
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
