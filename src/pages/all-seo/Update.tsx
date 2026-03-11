import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Save, ArrowLeft } from 'lucide-react'

interface SEOData {
  is_indexed: number
  is_followed: number
  meta_header: string
  meta_footer: string
}

export default function AllSEOUpdate() {
  const navigate = useNavigate()
  const [seoData, setSeoData] = useState<SEOData>({
    is_indexed: 1,
    is_followed: 1,
    meta_header: '',
    meta_footer: ''
  })

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchSEOData()
  }, [])

  const fetchSEOData = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/all-seo`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch SEO data')
      }
      
      const data = await response.json()
      setSeoData(data.data || {
        is_indexed: 1,
        is_followed: 1,
        meta_header: '',
        meta_footer: ''
      })
    } catch (err) {
      console.error('Error fetching SEO data:', err)
      setErrorMessage('Failed to load SEO data')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSubmitting(true)

    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const formData = new FormData()

      // Add method override for Laravel to handle PUT with FormData
      formData.append('_method', 'PUT')

      // Always send these required fields with fallback values
      console.log('Submitting SEO data:', seoData)
      formData.append('is_indexed', (seoData.is_indexed !== undefined ? seoData.is_indexed : 1).toString())
      formData.append('is_followed', (seoData.is_followed !== undefined ? seoData.is_followed : 1).toString())
      
      if (seoData.meta_header) {
        formData.append('meta_header', seoData.meta_header)
      }
      
      if (seoData.meta_footer) {
        formData.append('meta_footer', seoData.meta_footer)
      }

      const response = await fetch(`${apiUrl}/admin/all-seo/1`, {
        method: 'POST', // Use POST with _method=PUT for FormData
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to update SEO data: ${text}`)
      }

      await Swal.fire({
        title: 'Success!',
        text: 'SEO data updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

    } catch (err) {
      console.error('Error updating SEO data:', err)

      let msg = err instanceof Error ? err.message : 'Unknown error'
      try {
        const jsonError = JSON.parse(msg.replace('Failed to update SEO data: ', ''))
        if (jsonError.errors) {
          msg = Object.values(jsonError.errors).flat().join('\n')
        }
      } catch (e) { }

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

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>Loading SEO data...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate('/content')}
          style={{
            backgroundColor: '#374151',
            color: '#f9fafb',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>All SEO Settings</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage website SEO settings</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>

          {/* Is Indexed */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Is Indexed</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: seoData.is_indexed === 0 ? '#ef4444' : '#10b981', fontSize: '14px' }}>
                {seoData.is_indexed === 0 ? 'Not Indexed' : 'Indexed'}
              </span>
              <button
                type="button"
                onClick={() => setSeoData(prev => ({ ...prev, is_indexed: prev.is_indexed === 1 ? 0 : 1 }))}
                style={{
                  width: '48px',
                  height: '24px',
                  backgroundColor: seoData.is_indexed === 1 ? '#10b981' : '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '12px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '1px',
                    left: seoData.is_indexed === 1 ? '26px' : '1px',
                    transition: 'left 0.2s'
                  }}
                />
              </button>
            </div>
          </div>

          {/* Is Followed */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Is Followed</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: seoData.is_followed === 0 ? '#ef4444' : '#10b981', fontSize: '14px' }}>
                {seoData.is_followed === 0 ? 'Not Followed' : 'Followed'}
              </span>
              <button
                type="button"
                onClick={() => setSeoData(prev => ({ ...prev, is_followed: prev.is_followed === 1 ? 0 : 1 }))}
                style={{
                  width: '48px',
                  height: '24px',
                  backgroundColor: seoData.is_followed === 1 ? '#10b981' : '#374151',
                  border: '1px solid #4b5563',
                  borderRadius: '12px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '50%',
                    position: 'absolute',
                    top: '1px',
                    left: seoData.is_followed === 1 ? '26px' : '1px',
                    transition: 'left 0.2s'
                  }}
                />
              </button>
            </div>
          </div>

          {/* Meta Header */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Meta Header</label>
            <textarea
              value={seoData.meta_header}
              onChange={(e) => setSeoData(prev => ({ ...prev, meta_header: e.target.value }))}
              rows={4}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#374151',
                color: '#f9fafb',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              placeholder="Enter meta header HTML tags"
            />
          </div>

          {/* Meta Footer */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Meta Footer</label>
            <textarea
              value={seoData.meta_footer}
              onChange={(e) => setSeoData(prev => ({ ...prev, meta_footer: e.target.value }))}
              rows={4}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: '#374151',
                color: '#f9fafb',
                boxSizing: 'border-box',
                resize: 'vertical'
              }}
              placeholder="Enter meta footer HTML tags"
            />
          </div>

          {errorMessage && (
            <div style={{
              backgroundColor: '#ef4444',
              color: 'white',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '16px',
              whiteSpace: 'pre-line'
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
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save size={16} />
              {submitting ? 'Updating...' : 'Update SEO'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/content')}
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
