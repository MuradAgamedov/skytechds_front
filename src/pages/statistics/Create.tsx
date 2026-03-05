import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Plus } from 'lucide-react'

interface Language {
  id: number
  title: string
  lang_code: string
}

export default function StatisticCreate() {
  const navigate = useNavigate()
  const [languages, setLanguages] = useState<Language[]>([])
  const [activeTab, setActiveTab] = useState<number>(0)
  const [status, setStatus] = useState<number>(1)

  const [icon, setIcon] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string>('')

  const [titles, setTitles] = useState<Record<number, string>>({})
  const [subtitles, setSubtitles] = useState<Record<number, string>>({})
  const [iconAltTexts, setIconAltTexts] = useState<Record<number, string>>({})

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchLanguages()
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
      if (!response.ok) throw new Error('Failed to fetch languages')
      const data = await response.json()
      setLanguages(data.data || [])
    } catch (err) {
      console.error('Error fetching languages:', err)
      setErrorMessage('Failed to load languages.')
    }
  }

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setIcon(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setIconPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeIcon = () => {
    setIcon(null)
    setIconPreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage('')

    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const formData = new FormData()
      formData.append('status', status === 1 ? 'true' : 'false')
      
      // Add translations as JSON object
      const translations: any = {}
      languages.forEach(lang => {
        translations[`title.${lang.id}`] = titles[lang.id] || ''
        translations[`subtitle.${lang.id}`] = subtitles[lang.id] || ''
        translations[`icon_alt_text.${lang.id}`] = iconAltTexts[lang.id] || ''
      })
      formData.append('translations', JSON.stringify(translations))

      // Also add individual fields for FormData compatibility
      languages.forEach(lang => {
        formData.append(`translations[title.${lang.id}]`, titles[lang.id] || '')
        formData.append(`translations[subtitle.${lang.id}]`, subtitles[lang.id] || '')
        formData.append(`translations[icon_alt_text.${lang.id}]`, iconAltTexts[lang.id] || '')
      })

      // Add icon file if exists
      if (icon) {
        formData.append('icon', icon)
      }

      const response = await fetch(`${apiUrl}/admin/statistics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create statistic')
      }

      const data = await response.json()

      await Swal.fire({
        title: 'Success!',
        text: 'Statistic created successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      navigate('/statistics')

    } catch (err: any) {
      console.error('Error creating statistic:', err)
      await Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to create statistic.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Create Statistic</h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Add a new statistic item</p>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>

          <div style={{ marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Status</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: status === 0 ? '#ef4444' : '#10b981', fontSize: '14px' }}>
                  {status === 0 ? 'Inactive' : 'Active'}
                </span>
                <button
                  type="button"
                  onClick={() => setStatus(status === 1 ? 0 : 1)}
                  style={{
                    width: '48px',
                    height: '24px',
                    backgroundColor: status === 1 ? '#10b981' : '#374151',
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
                      left: status === 1 ? '26px' : '1px',
                      transition: 'left 0.2s'
                    }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Icon Upload */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Icon</label>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              {iconPreview && (
                <div style={{
                  width: '120px',
                  height: '120px',
                  backgroundColor: '#374151',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  border: '1px solid #4b5563',
                  position: 'relative'
                }}>
                  <img
                    src={iconPreview}
                    alt="Icon preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    onClick={removeIcon}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      width: '24px',
                      height: '24px',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: '12px'
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
              <div style={{ flex: 1 }}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #4b5563',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#374151',
                    color: '#f9fafb',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{ color: '#6b7280', fontSize: '12px', margin: '4px 0 0 0' }}>
                  Upload icon image (optional)
                </p>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #374151' }}>
              {languages.map((language, index) => (
                <button
                  key={language.id}
                  type="button"
                  onClick={() => setActiveTab(index)}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: activeTab === index ? '#374151' : 'transparent',
                    color: activeTab === index ? '#f9fafb' : '#6b7280',
                    border: 'none',
                    borderBottom: activeTab === index ? '2px solid #3b82f6' : '2px solid transparent',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: activeTab === index ? '500' : '400',
                    transition: 'all 0.2s'
                  }}
                >
                  {language.title}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '24px' }}>
            {languages.map((language, index) => (
              <div key={language.id} style={{ display: activeTab === index ? 'block' : 'none' }}>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Title ({language.title})</label>
                  <input
                    type="text"
                    value={titles[language.id] || ''}
                    onChange={(e) => setTitles(prev => ({ ...prev, [language.id]: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #4b5563',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#374151',
                      color: '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter title"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Subtitle ({language.title})</label>
                  <input
                    type="text"
                    value={subtitles[language.id] || ''}
                    onChange={(e) => setSubtitles(prev => ({ ...prev, [language.id]: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #4b5563',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#374151',
                      color: '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter subtitle"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Icon Alt Text ({language.title})</label>
                  <input
                    type="text"
                    value={iconAltTexts[language.id] || ''}
                    onChange={(e) => setIconAltTexts(prev => ({ ...prev, [language.id]: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #4b5563',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#374151',
                      color: '#f9fafb',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Enter icon alt text"
                  />
                </div>
              </div>
            ))}
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

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => navigate('/statistics')}
              style={{
                padding: '10px 20px',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: '#374151',
                color: '#f9fafb',
                transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer',
                backgroundColor: submitting ? '#6b7280' : '#3b82f6',
                color: '#f9fafb',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {submitting ? 'Creating...' : (
                <>
                  <Plus size={16} />
                  Create Statistic
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
