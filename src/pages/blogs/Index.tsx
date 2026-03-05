import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { FileText, Plus, Edit, Trash2 } from 'lucide-react'

interface Blog {
  id: number
  slug: string
  card_image: string | null
  translations: Array<{
    id: number
    title: string
    language_id: number
  }>
  created_at: string
  updated_at: string
}

export default function BlogsIndex() {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState<Blog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/admin/blogs`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch blogs')
      }
      const data = await response.json()
      setBlogs(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching blogs:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteBlog = async (id: number) => {
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

      const response = await fetch(`${apiUrl}/admin/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to delete blog')
      }

      await Swal.fire({
        title: 'Deleted!',
        text: 'Blog has been deleted.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      fetchBlogs()
    } catch (err) {
      await Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to delete blog',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
      console.error('Error deleting blog:', err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getTranslationTextFromNested = (translations: Array<any>, field: string, languageId: number) => {
    if (!translations) return ''
    const translation = translations.find(t => t.language_id === languageId)
    return translation ? translation[field] || '' : ''
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Blogs</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage blog posts</p>
        </div>
        <button
          onClick={() => navigate('/blogs/create')}
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
          Add Blog
        </button>
      </div>

      {!loading && !error && blogs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
          <FileText size={48} style={{ marginBottom: '16px', color: '#6b7280' }} />
          <p style={{ marginBottom: '8px' }}>No blogs found</p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>No blog posts have been created yet!</p>
        </div>
      )}

      {!loading && !error && blogs.length > 0 && (
        <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#374151' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '15%' }}>Image</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '25%' }}>Title</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '20%' }}>Slug</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '15%' }}>Created</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '10%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((blog) => (
                <tr key={blog.id} style={{ backgroundColor: '#1f2937' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151' }}>
                    {blog.card_image ? (
                      <div style={{
                        width: '60px',
                        height: '40px',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        backgroundColor: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img
                          src={blog.card_image}
                          alt="Blog"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => { e.currentTarget.style.display = 'none' }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: '60px',
                        height: '40px',
                        borderRadius: '4px',
                        backgroundColor: '#374151',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        fontSize: '10px'
                      }}>
                        No Image
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                    <div style={{
                      maxWidth: '250px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      fontWeight: '500'
                    }}>
                      {getTranslationTextFromNested(blog.translations, 'title', 3) ||
                        getTranslationTextFromNested(blog.translations, 'title', 4) ||
                        getTranslationTextFromNested(blog.translations, 'title', 5) || 'Untitled'}
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                    <div style={{ fontSize: '14px', color: '#9ca3af' }}>
                      {blog.slug}
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatDate(blog.created_at)}
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => navigate(`/blogs/update/${blog.id}`)}
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
                        onClick={() => deleteBlog(blog.id)}
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
          Error: {error}
        </div>
      )}
    </div>
  )
}
