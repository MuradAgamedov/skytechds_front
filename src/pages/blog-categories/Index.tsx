import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { FolderTree, Plus, Edit, Trash2 } from 'lucide-react'

interface BlogCategory {
  id: number
  slug: string
  translations: Array<{
    id: number
    title: string
    seo_title: string
    seo_description: string
    seo_keywords: string
    language_id: number
  }>
  status: number
  created_at: string
  updated_at: string
}

interface Language {
  id: number
  title: string
  lang_code: string
}

export default function BlogCategoriesIndex() {
  const navigate = useNavigate()
  const [blogCategories, setBlogCategories] = useState<BlogCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [languages, setLanguages] = useState<Language[]>([])

  useEffect(() => {
    fetchLanguages()
    fetchBlogCategories()
  }, [])

  const fetchLanguages = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/admin/languages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch languages')
      }
      const data = await response.json()
      setLanguages(data.data || [])
    } catch (err) {
      console.error('Error fetching languages:', err)
    }
  }

  const fetchBlogCategories = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/admin/blog-categories`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch blog categories')
      }
      const data = await response.json()
      setBlogCategories(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching blog categories:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteBlogCategory = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) return

    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/admin/blog-categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to delete blog category')
      }

      await Swal.fire({
        title: 'Deleted!',
        text: 'Blog category has been deleted.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      // Refresh the blog categories list
      fetchBlogCategories()
    } catch (err) {
      await Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to delete blog category',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
      setError(err instanceof Error ? err.message : 'Failed to delete blog category')
      console.error('Error deleting blog category:', err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTranslationText = (translations: Record<number, any>, field: string, languageId: number) => {
    return translations[field]?.[languageId] || ''
  }

  const getTranslationTextFromNested = (translations: Array<{ id: number, title: string, language_id: number }>, field: string, languageId: number) => {
    // Handle array of translations structure like in the API response
    const translation = translations.find(t => t.language_id === languageId)
    return translation ? translation[field] || '' : ''
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
        <button
          onClick={() => navigate('/blog-categories')}
          style={{
            backgroundColor: '#374151',
            color: '#f9fafb',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Back to List
        </button>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Blog Categories</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage blog categories and their translations</p>
        </div>
        <button
          onClick={() => navigate('/blog-categories/create')}
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
          Add Category
        </button>
      </div>

      {!loading && !error && blogCategories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
          <FolderTree size={48} style={{ marginBottom: '16px', color: '#6b7280' }} />
          <p style={{ marginBottom: '8px' }}>No blog categories found</p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>No categories have been created yet!</p>
        </div>
      )}

      {!loading && !error && blogCategories.length > 0 && (
        <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#374151' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '20%' }}>Slug</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '40%' }}>Title</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '10%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogCategories.map((category) => (
                <tr key={category.id} style={{ backgroundColor: '#1f2937' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb', width: '20%' }}>
                    <div style={{ fontWeight: '500' }}>
                      {category.slug}
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb', width: '40%' }}>
                    <div style={{
                      maxWidth: '300px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {getTranslationTextFromNested(category.translations, 'title', 3) ||
                        getTranslationTextFromNested(category.translations, 'title', 4) ||
                        getTranslationTextFromNested(category.translations, 'title', 5)}
                    </div>
                  </td>

                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', width: '10%' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => navigate(`/blog-categories/update/${category.id}`)}
                        style={{
                          backgroundColor: '#10b981',
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
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteBlogCategory(category.id)}
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
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
      }

      {
        error && (
          <div style={{
            backgroundColor: '#ef4444',
            color: 'white',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
            Error: {error}
          </div>
        )
      }
    </div >
  )
}
