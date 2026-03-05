import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'

interface Email {
  id: number
  email: string
  status: number | 'active' | 'inactive'
}

export default function EmailUpdate() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [formData, setFormData] = useState({
    email: '',
    status: 'active' as 'active' | 'inactive'
  })

  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!id) return;

    const fetchEmail = async () => {
      try {
        const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
        const token = localStorage.getItem('auth_token')
        const res = await fetch(`${apiUrl}/admin/emails/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        })
        if (!res.ok) throw new Error('Failed to fetch email')
        const json = await res.json()
        const email = json.data
        setFormData({
          email: email.email,
          status: email.status === 1 ? 'active' : 'inactive'
        })
      } catch (err) {
        console.error('Error loading email:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEmail()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) {
      setErrorMessage('No email ID provided')
      return
    }
    setErrorMessage('')
    setSubmitting(true)
    console.log('submitting update', id, formData)
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const payload = {
        email: formData.email,
        status: formData.status === 'active' ? 1 : 0
      }

      const response = await fetch(`${apiUrl}/admin/emails/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to update email: ${response.status} ${text}`)
      }
      
      console.log('Email updated successfully:', payload)
      
      await Swal.fire({
        title: 'Success!',
        text: 'Email has been updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })
      
      // Navigate back to the list after successful update
      navigate('/emails')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error updating email:', msg)
      setErrorMessage(msg)
      
      await Swal.fire({
        title: 'Error!',
        text: msg,
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Update Email</h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Edit email information</p>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#f9fafb' }}>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#374151',
                color: '#f9fafb'
              }}
              placeholder="Enter email address (e.g., example@domain.com)"
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#f9fafb' }}>Status</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: formData.status === 'inactive' ? '#ef4444' : '#6b7280', fontSize: '14px' }}>Inactive</span>
              <label style={{ 
                position: 'relative', 
                display: 'inline-block', 
                width: '50px', 
                height: '24px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  name="status"
                  checked={formData.status === 'active'}
                  onChange={(e) => {
                    const newValue = e.target.checked ? 'active' : 'inactive';
                    setFormData(prev => ({ ...prev, status: newValue as 'active' | 'inactive' }));
                  }}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span style={{
                  position: 'absolute',
                  cursor: 'pointer',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: formData.status === 'active' ? '#10b981' : '#374151',
                  transition: '.4s',
                  borderRadius: '24px',
                  border: `1px solid ${formData.status === 'active' ? '#10b981' : '#4b5563'}`
                }}>
                  <span style={{
                    position: 'absolute',
                    content: '""',
                    height: '16px',
                    width: '16px',
                    left: formData.status === 'active' ? '26px' : '3px',
                    bottom: '3px',
                    backgroundColor: 'white',
                    transition: '.4s',
                    borderRadius: '50%'
                  }} />
                </span>
              </label>
              <span style={{ color: formData.status === 'active' ? '#10b981' : '#6b7280', fontSize: '14px' }}>Active</span>
            </div>
          </div>

          {errorMessage && (
            <div style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              {errorMessage}
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: submitting ? '#93c5fd' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '8px 16px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              {submitting ? 'Updating…' : 'Update Email'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/emails')}
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
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
