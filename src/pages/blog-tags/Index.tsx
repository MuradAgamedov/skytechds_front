import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface BlogTag {
  id: number
  name: string
  translations: Array<{
    id: number
    title: string
    language_id: number
  }>
  status: number
}

export default function BlogTagsIndex() {
  const navigate = useNavigate()
  const [tags, setTags] = useState<BlogTag[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${apiUrl}/admin/tags`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setTags(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching tags:', err)
      setErrorMessage('Failed to load tags.')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    const { value: title } = await Swal.fire({
      title: 'Create New Tag',
      input: 'text',
      inputLabel: 'Tag Title',
      inputPlaceholder: 'Enter tag title',
      showCancelButton: true,
      confirmButtonText: 'Create',
      confirmButtonColor: '#3b82f6',
      preConfirm: async (result) => {
        if (!result.value) {
          Swal.showValidationMessage('Please enter a tag title')
          return false
        }
        return result.value
      }
    })

    if (!title) return

    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/admin/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create tag')
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Tag created successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      fetchTags()
    } catch (err) {
      console.error('Error creating tag:', err)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to create tag.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const handleEdit = async (tag: BlogTag) => {
    const { value: title } = await Swal.fire({
      title: 'Edit Tag',
      input: 'text',
      inputLabel: 'Tag Title',
      inputValue: tag.translations.find(t => t.language_id === 1)?.title || '',
      showCancelButton: true,
      confirmButtonText: 'Update',
      confirmButtonColor: '#3b82f6',
      preConfirm: async (result) => {
        if (!result.value) {
          Swal.showValidationMessage('Please enter a tag title')
          return false
        }
        return result.value
      }
    })

    if (!title) return

    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/admin/tags/${tag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update tag')
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Tag updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      fetchTags()
    } catch (err) {
      console.error('Error updating tag:', err)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to update tag.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const handleDelete = async (tag: BlogTag) => {
    const result = await Swal.fire({
      title: 'Delete Tag?',
      text: `Are you sure you want to delete "${tag.translations.find(t => t.language_id === 1)?.title || 'Tag'}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    })

    if (!result.isConfirmed) return

    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/admin/tags/${tag.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete tag')
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Tag deleted successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      fetchTags()
    } catch (err) {
      console.error('Error deleting tag:', err)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete tag.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const getTagTitle = (tag: BlogTag) => {
    if (tag.name) {
      return tag.name
    }
    const azTitle = tag.translations.find(t => t.language_id === 1)?.title
    const enTitle = tag.translations.find(t => t.language_id === 2)?.title
    return azTitle || enTitle || tag.name
  }

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 1:
        return { text: 'Active', color: '#10b981', backgroundColor: '#d1fae5' }
      case 0:
        return { text: 'Inactive', color: '#6b7280', backgroundColor: '#fef3c7' }
      default:
        return { text: 'Unknown', color: '#9ca3af', backgroundColor: '#f3f4f6' }
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', color: '#f9fafb' }}>Loading tags...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Blog Tags Management</h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage blog post tags</p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={handleCreate}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Plus size={18} />
          Create New Tag
        </button>
      </div>

      {errorMessage && (
        <div style={{
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px'
        }}>
          {errorMessage}
        </div>
      )}

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#1f2937' }}>
            <thead>
              <tr style={{ backgroundColor: '#374151' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', borderBottom: '1px solid #4b5563' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', borderBottom: '1px solid #4b5563' }}>Title</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', borderBottom: '1px solid #4b5563' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', borderBottom: '1px solid #4b5563' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map(tag => (
                <tr key={tag.id} style={{ borderBottom: '1px solid #374151' }}>
                  <td style={{ padding: '12px', color: '#f9fafb' }}>{tag.id}</td>
                  <td style={{ padding: '12px', color: '#f9fafb' }}>{getTagTitle(tag)}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ ...getStatusBadge(tag.status), padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                      {getStatusBadge(tag.status).text}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEdit(tag)}
                      style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        marginRight: '8px'
                      }}
                      title="Edit tag"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(tag)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                      title="Delete tag"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
