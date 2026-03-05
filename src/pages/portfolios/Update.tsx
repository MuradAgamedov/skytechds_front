import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Edit } from 'lucide-react'

interface Language {
  id: number
  title: string
  lang_code: string
}

interface Portfolio {
  id: number
  translations: Array<{
    id: number
    title: string
    description?: string
    seo_title?: string
    seo_description?: string
    seo_keywords?: string
  }>
  status: number | null
  card_image: string | null
  url: string | null
}

export default function PortfolioUpdate() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [languages, setLanguages] = useState<Language[]>([])
  const [activeTab, setActiveTab] = useState<number>(0)

  const [cardImage, setCardImage] = useState<File | null>(null)
  const [cardImagePreview, setCardImagePreview] = useState<string>('')
  const [status, setStatus] = useState<number>(1)
  const [url, setUrl] = useState<string>('')

  const [titles, setTitles] = useState<Record<number, string>>({})

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchLanguages()
      .then(() => fetchPortfolio())
  }, [id])

  const fetchLanguages = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${apiUrl}/admin/languages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setLanguages(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching languages:', err)
    }
  }

  const fetchPortfolio = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${apiUrl}/admin/portfolios/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}` 
        }
      })
      if (!response.ok) throw new Error('Failed to fetch portfolio details')
      const data = await response.json()
      const portfolio = data.data

      setStatus(portfolio.status || 1)
      setUrl(portfolio.url || '')
      if (portfolio.card_image) setCardImagePreview(portfolio.card_image)

      const initialTitles: Record<number, string> = {}

      if (portfolio.translations && Array.isArray(portfolio.translations)) {
        portfolio.translations.forEach((t: any, index: number) => {
          // Use index+1 as language_id since it's not provided by API
          const languageId = index + 1
          initialTitles[languageId] = t.title || ''
        })
      }

      setTitles(initialTitles)

    } catch (err) {
      console.error('Error fetching portfolio:', err)
      setErrorMessage('Failed to load portfolio details.')
    } finally {
      setLoading(false)
    }
  }

  const handleCardImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCardImage(file)
      setCardImagePreview(URL.createObjectURL(file))
    }
  }

  const removeCardImage = () => {
    setCardImage(null)
    setCardImagePreview('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSubmitting(true)

    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const formData = new FormData()
      formData.append('_method', 'PUT')
      
      if (status !== null) {
        formData.append('status', status.toString())
      }
      
      if (url) {
        formData.append('url', url)
      }

      if (cardImage) {
        formData.append('card_image', cardImage)
      }

      languages.forEach(lang => {
        if (titles[lang.id]) formData.append(`translations[title][${lang.id}]`, titles[lang.id])
      })

      const response = await fetch(`${apiUrl}/admin/portfolios/${id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}` 
        },
        body: formData
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to update portfolio: ${text}`)
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Portfolio updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      navigate('/portfolios')
    } catch (err) {
      console.error('Error updating portfolio:', err)

      let msg = err instanceof Error ? err.message : 'Unknown error'
      try {
        const jsonError = JSON.parse(msg.replace('Failed to update portfolio: ', ''))
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
    return <div style={{ padding: '20px', color: '#f9fafb' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Update Portfolio</h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Modify an existing portfolio item</p>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
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

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
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
                placeholder="https://example.com"
              />
            </div>
          </div>

          {/* Card Image Upload */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Card Image</label>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              {cardImagePreview && (
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
                    src={cardImagePreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.currentTarget
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = '<div style="color: #6b7280; font-size: 12px; text-align: center; padding: 10px;">Image not available</div>'
                    }}
                  />
                  <button
                    type="button"
                    onClick={removeCardImage}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
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
                  onChange={handleCardImageChange}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '8px',
                    color: '#f9fafb',
                    border: '1px dashed #4b5563',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: '#374151'
                  }}
                />
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                  Leave empty to keep existing image.
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
                    placeholder="Portfolio title"
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
              <Edit size={16} />
              {submitting ? 'Updating...' : 'Update Portfolio'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/portfolios')}
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
