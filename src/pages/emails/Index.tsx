import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Edit, Trash2 } from 'lucide-react'

interface Email {
  id: number
  email: string
  status: number | 'active' | 'inactive'
}

export default function EmailsIndex() {
  const navigate = useNavigate()
  const [emails, setEmails] = useState<Email[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchEmails()
  }, [])

  const fetchEmails = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/emails`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch emails')
      }
      const data = await response.json()
      // API returns object with data array inside
      setEmails(data.data || [])
      console.log('Emails data from API:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching emails:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteEmail = async (id: number) => {
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
      
      const response = await fetch(`${apiUrl}/admin/emails/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to delete email')
      }
      
      await Swal.fire({
        title: 'Deleted!',
        text: 'Email has been deleted.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })
      
      // Refresh the emails list
      fetchEmails()
    } catch (err) {
      await Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to delete email',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
      setError(err instanceof Error ? err.message : 'Failed to delete email')
      console.error('Error deleting email:', err)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Emails</h1>
        <button 
          onClick={() => navigate('/emails/create')}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Create New Email
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
          Loading emails...
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
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '40%' }}>Email Address</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '20%' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '40%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {emails.map((email) => (
                <tr key={email.id} style={{ backgroundColor: '#1f2937' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb', width: '40%' }}>{email.email}</td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', width: '20%' }}>
                    <span 
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: (email.status === 1 || email.status === 'active') ? '#10b981' : '#ef4444',
                        color: 'white'
                      }}
                    >
                      {(email.status === 1 || email.status === 'active') ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', width: '40%' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                      <button 
                        onClick={() => navigate(`/emails/update/${email.id}`)}
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
                        onClick={() => deleteEmail(email.id)}
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

      {!loading && !error && emails.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
          No emails found. Create your first email!
        </div>
      )}
    </div>
  )
}
