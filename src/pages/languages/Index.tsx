import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Edit, Trash2 } from 'lucide-react'

interface Language {
  id: number
  title: string
  lang_code: string
  status: number | 'active' | 'inactive'
  is_default: number | boolean
}

export default function LanguagesIndex() {
  const navigate = useNavigate()
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchLanguages()
  }, [])

  const fetchLanguages = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/languages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch languages')
      }
      const data = await response.json()
      // API returns object with data array inside
      setLanguages(data.data || [])
      console.log('Languages data from API:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching languages:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteLanguage = async (id: number) => {
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
      
      const response = await fetch(`${apiUrl}/admin/languages/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to delete language')
      }
      
      await Swal.fire({
        title: 'Deleted!',
        text: 'Language has been deleted.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })
      
      // Refresh the languages list
      fetchLanguages()
    } catch (err) {
      await Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to delete language',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
      setError(err instanceof Error ? err.message : 'Failed to delete language')
      console.error('Error deleting language:', err)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Languages</h1>
        <button 
          onClick={() => navigate('/languages/create')}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Create New Language
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
          Loading languages...
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

      {!loading && !error && (
        <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#374151' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '30%' }}>Title</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '15%' }}>Language Code</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '15%' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '15%' }}>Default</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '25%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {languages.map((language) => (
                <tr key={language.id} style={{ backgroundColor: '#1f2937' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb', width: '30%' }}>{language.title}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb', width: '15%' }}>{language.lang_code}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', width: '15%' }}>
                    <span 
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: (language.status === 1 || language.status === 'active') ? '#10b981' : '#ef4444',
                        color: 'white'
                      }}
                    >
                      {(language.status === 1 || language.status === 'active') ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', width: '15%' }}>
                    <span 
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: (language.is_default === 1 || language.is_default === true) ? '#3b82f6' : '#6b7280',
                        color: 'white'
                      }}
                    >
                      {(language.is_default === 1 || language.is_default === true) ? 'Default' : 'Regular'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', width: '25%' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                      <button 
                        onClick={() => navigate(`/languages/update/${language.id}`)}
                        style={{
                          backgroundColor: '#f59e0b',
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
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this language?')) {
                            deleteLanguage(language.id)
                          }
                        }}
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

      {!loading && !error && languages.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
          No languages found. Create your first language!
        </div>
      )}
    </div>
  )
}
