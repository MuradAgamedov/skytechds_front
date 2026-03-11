import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Save, ArrowLeft } from 'lucide-react'

interface Language {
  id: number
  title: string
  lang_code: string
}

interface Translation {
  id: number
  title: string
  seo_title: string
  seo_description: string
  seo_keywords: string
}

interface Page {
  id: number
  translations: Translation[]
  status: number
  order: number
  slug: string
}

export default function PageUpdate() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [languages, setLanguages] = useState<Language[]>([])
  const [activeTab, setActiveTab] = useState<number>(0)
  const [page, setPage] = useState<Page | null>(null)

  const [status, setStatus] = useState<number>(1)
  const [slug, setSlug] = useState<string>('')

  const [titles, setTitles] = useState<Record<number, string>>({})
  const [seoTitles, setSeoTitles] = useState<Record<number, string>>({})
  const [seoDescriptions, setSeoDescriptions] = useState<Record<number, string>>({})
  const [seoKeywords, setSeoKeywords] = useState<Record<number, string>>({})

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchLanguages().then(langs => {
      if (langs && id) {
        fetchPage(langs)
      }
    })
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
        const langs = data.data || []
        setLanguages(langs)
        return langs
      }
      return null
    } catch (err) {
      console.error('Error fetching languages:', err)
      return null
    }
  }

  const fetchPage = async (currentLangs: Language[]) => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${apiUrl}/admin/pages/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch page')
      }

      const data = await response.json()
      const pageData = data.data
      setPage(pageData)
      setStatus(pageData.status)
      setSlug(pageData.slug)

      // Initialize translation data - map translations to languages by order
      const newTitles: Record<number, string> = {}
      const newSeoTitles: Record<number, string> = {}
      const newSeoDescriptions: Record<number, string> = {}
      const newSeoKeywords: Record<number, string> = {}

      // Map translations to languages by array index order
      if (pageData.translations && Array.isArray(pageData.translations)) {
        pageData.translations.forEach((translation: Translation, index: number) => {
          const langId = currentLangs[index]?.id || translation.id;
          if (langId) {
            newTitles[langId] = translation.title || ''
            newSeoTitles[langId] = translation.seo_title || ''
            newSeoDescriptions[langId] = translation.seo_description || ''
            newSeoKeywords[langId] = translation.seo_keywords || ''
          }
        })
      }

      setTitles(newTitles)
      setSeoTitles(newSeoTitles)
      setSeoDescriptions(newSeoDescriptions)
      setSeoKeywords(newSeoKeywords)
    } catch (err) {
      console.error('Error fetching page:', err)
      setErrorMessage('Failed to load page')
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

      if (status !== null) {
        formData.append('status', status ? '1' : '0')
      }

      if (slug) {
        formData.append('slug', slug)
      }

      formData.append('_method', 'PUT')

      // Add all language translations in the format Laravel expects: translations[field][lang_id]
      languages.forEach(lang => {
        formData.append(`translations[title][${lang.id}]`, titles[lang.id] || '')
        formData.append(`translations[seo_title][${lang.id}]`, seoTitles[lang.id] || '')
        formData.append(`translations[seo_description][${lang.id}]`, seoDescriptions[lang.id] || '')
        formData.append(`translations[seo_keywords][${lang.id}]`, seoKeywords[lang.id] || '')
      })

      const response = await fetch(`${apiUrl}/admin/pages/${id}`, {
        method: 'POST', // Use POST with _method=PUT for multipart data
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to update page: ${text}`)
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Page updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      navigate('/pages')
    } catch (err) {
      console.error('Error updating page:', err)

      let msg = err instanceof Error ? err.message : 'Unknown error'
      try {
        const jsonError = JSON.parse(msg.replace('Failed to update page: ', ''))
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
        <div>Loading page...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={() => navigate('/pages')}
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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Update Page</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Edit website page</p>
        </div>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>

          {/* Status */}
          <div style={{ marginBottom: '24px' }}>
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

          {/* Slug */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
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
              placeholder="Enter page slug (e.g., about-us)"
            />
          </div>

          {/* Language Tabs */}
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

          {/* Tab Content */}
          <div style={{ marginBottom: '24px' }}>
            {languages.map((language, index) => (
              <div key={language.id} style={{ display: activeTab === index ? 'block' : 'none' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>
                    Title ({language.title})
                  </label>
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
                    placeholder="Enter page title"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>
                    SEO Title ({language.title})
                  </label>
                  <input
                    type="text"
                    value={seoTitles[language.id] || ''}
                    onChange={(e) => setSeoTitles(prev => ({ ...prev, [language.id]: e.target.value }))}
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
                    placeholder="Enter SEO title"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>
                    SEO Description ({language.title})
                  </label>
                  <textarea
                    value={seoDescriptions[language.id] || ''}
                    onChange={(e) => setSeoDescriptions(prev => ({ ...prev, [language.id]: e.target.value }))}
                    rows={3}
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
                    placeholder="Enter SEO description"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>
                    SEO Keywords ({language.title})
                  </label>
                  <input
                    type="text"
                    value={seoKeywords[language.id] || ''}
                    onChange={(e) => setSeoKeywords(prev => ({ ...prev, [language.id]: e.target.value }))}
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
                    placeholder="Enter SEO keywords (comma separated)"
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
              <Save size={16} />
              {submitting ? 'Updating...' : 'Update Page'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/pages')}
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
