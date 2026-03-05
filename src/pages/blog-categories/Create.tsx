import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { ArrowLeft, Save } from 'lucide-react'

interface Language {
  id: number
  title: string
  lang_code: string
}

interface TranslationData {
  title: Record<number, string>
  seo_title: Record<number, string>
  seo_description: Record<number, string>
  seo_keywords: Record<number, string>
}

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

export default function BlogCategoryCreate() {
  const navigate = useNavigate()
  const [languages, setLanguages] = useState<Language[]>([])
  const [activeTab, setActiveTab] = useState<number>(0)
  const [slug, setSlug] = useState('')
  const [translations, setTranslations] = useState<TranslationData>({
    title: {},
    seo_title: {},
    seo_description: {},
    seo_keywords: {}
  })
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchLanguages()
  }, [])

  const fetchLanguages = async () => {
    try {
      const apiUrl = (import.meta.env as any)?.VITE_API_URL || 'http://127.0.0.1:8000/api'
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

  const handleSlugChange = (value: string) => {
    // Convert to slug format: lowercase letters, numbers, and hyphens only
    const slug = value.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
    setSlug(slug)
  }

  const handleTranslationChange = (field: keyof TranslationData, languageId: number, value: string) => {
    setTranslations(prev => ({
      ...prev,
      [field]: {
        ...prev[field],
        [languageId]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSubmitting(true)

    try {
      const apiUrl = (import.meta.env as any)?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const formData = new FormData()

      // Add slug
      formData.append('slug', slug)

      // Add translations in the format backend expects
      languages.forEach(lang => {
        if (translations.title[lang.id]) {
          formData.append(`translations[title][${lang.id}]`, translations.title[lang.id])
        }
        if (translations.seo_title[lang.id]) {
          formData.append(`translations[seo_title][${lang.id}]`, translations.seo_title[lang.id])
        }
        if (translations.seo_description[lang.id]) {
          formData.append(`translations[seo_description][${lang.id}]`, translations.seo_description[lang.id])
        }
        if (translations.seo_keywords[lang.id]) {
          formData.append(`translations[seo_keywords][${lang.id}]`, translations.seo_keywords[lang.id])
        }
      })

      const response = await fetch(`${apiUrl}/admin/blog-categories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create blog category')
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Blog category created successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      navigate('/blog-categories')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      console.error('Error creating blog category:', msg)
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

  if (loading && languages.length === 0) {
    return <div style={{ padding: '20px' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
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
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <ArrowLeft size={16} />
          Back to List
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Create Blog Category</h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Create a new blog category with multilingual support</p>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>

          {/* Slug Field */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>
              Slug *
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
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
              placeholder="Enter slug (e.g., my-category)"
              required
            />
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
              URL-friendly version of the name. Only lowercase letters, numbers, and hyphens allowed.
            </p>
          </div>

          {/* Translation Tabs */}
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
                    Title ({language.title}) *
                  </label>
                  <input
                    type="text"
                    value={translations.title[language.id] || ''}
                    onChange={(e) => handleTranslationChange('title', language.id, e.target.value)}
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
                    placeholder={`Enter title in ${language.title}`}
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>
                    SEO Title ({language.title})
                  </label>
                  <input
                    type="text"
                    value={translations.seo_title[language.id] || ''}
                    onChange={(e) => handleTranslationChange('seo_title', language.id, e.target.value)}
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
                    placeholder={`Enter SEO title in ${language.title}`}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>
                    SEO Description ({language.title})
                  </label>
                  <textarea
                    value={translations.seo_description[language.id] || ''}
                    onChange={(e) => handleTranslationChange('seo_description', language.id, e.target.value)}
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #4b5563',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#374151',
                      color: '#f9fafb',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                    placeholder={`Enter SEO description in ${language.title}`}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>
                    SEO Keywords ({language.title})
                  </label>
                  <input
                    type="text"
                    value={translations.seo_keywords[language.id] || ''}
                    onChange={(e) => handleTranslationChange('seo_keywords', language.id, e.target.value)}
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
                    placeholder={`Enter SEO keywords in ${language.title} (comma separated)`}
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
              <Save size={16} style={{ marginRight: '8px' }} />
              {submitting ? 'Creating...' : 'Create Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
