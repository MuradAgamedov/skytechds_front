import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

const PLATFORMS = [
  { value: 'facebook', label: 'Facebook', icon: '📘' },
  { value: 'twitter', label: 'Twitter', icon: '🐦' },
  { value: 'instagram', label: 'Instagram', icon: '📷' },
  { value: 'youtube', label: 'YouTube', icon: '📺' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'pinterest', label: 'Pinterest', icon: '📌' },
  { value: 'reddit', label: 'Reddit', icon: '🤖' },
  { value: 'telegram', label: 'Telegram', icon: '✈️' },
  { value: 'whatsapp', label: 'WhatsApp', icon: '💬' },
  { value: 'discord', label: 'Discord', icon: '🎮' },
  { value: 'threads', label: 'Threads', icon: '🧵' },
  { value: 'twitch', label: 'Twitch', icon: '🎬' },
  { value: 'wechat', label: 'WeChat', icon: '💬' }
]

export default function SocialNetworkCreate() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    platform: '',
    url: '',
    status: 'active' as 'active' | 'inactive'
  })

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSubmitting(true)
    
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const payload = {
        platform: formData.platform,
        url: formData.url,
        status: formData.status === 'active' ? 1 : 0
      }

      const response = await fetch(`${apiUrl}/admin/social-networks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      })
      
      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to create social network: ${response.status} ${text}`)
      }
      
      await Swal.fire({
        title: 'Success!',
        text: 'Social network has been created successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })
      
      // Navigate back to the list after successful creation
      navigate('/social-networks')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error creating social network:', msg)
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

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked ? 'active' : 'inactive';
    setFormData(prev => ({ ...prev, status: newValue as 'active' | 'inactive' }));
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Create Social Network</h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Add new social network link</p>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#f9fafb' }}>
              Platform
            </label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
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
            >
              <option value="">Select a platform</option>
              {PLATFORMS.map(platform => (
                <option key={platform.value} value={platform.value}>
                  {platform.icon} {platform.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#f9fafb' }}>
              URL
            </label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
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
              placeholder="https://example.com/username"
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
                  checked={formData.status === 'active'}
                  onChange={handleStatusChange}
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
              {submitting ? 'Creating…' : 'Create Social Network'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/social-networks')}
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
