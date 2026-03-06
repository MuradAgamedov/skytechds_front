import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Edit } from 'lucide-react'

interface Language {
  id: number
  title: string
  lang_code: string
}

export default function BlogCategoryUpdate() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [languages, setLanguages] = useState<Language[]>([])
  const [activeTab, setActiveTab] = useState<number>(0)

  const [slug, setSlug] = useState('')
  const [status, setStatus] = useState<number>(1)
  const [titles, setTitles] = useState<Record<number, string>>({})
  const [seoTitles, setSeoTitles] = useState<Record<number, string>>({})
  const [seoDescriptions, setSeoDescriptions] = useState<Record<number, string>>({})
  const [seoKeywords, setSeoKeywords] = useState<Record<number, string>>({})

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchLanguages().then(langs => {
      if (langs) fetchBlogCategory(langs)
    })
  }, [id])

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
      const langs = data.data || []
      setLanguages(langs)
      return langs
    } catch (err) {
      console.error('Error fetching languages:', err)
      setErrorMessage('Failed to load languages.')
    }
  }

  const fetchBlogCategory = async (currentLangs: Language[]) => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${apiUrl}/admin/blog-categories/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch blog category')
      const data = await response.json()
      const category = data.data

      setSlug(category.slug || '')
      setStatus(category.status || 0)

      const initialTitles: Record<number, string> = {}
      const initialSeoTitles: Record<number, string> = {}
      const initialSeoDescriptions: Record<number, string> = {}
      const initialSeoKeywords: Record<number, string> = {}

      if (category.translations && Array.isArray(category.translations)) {
        category.translations.forEach((t: any, index: number) => {
          const langId = currentLangs[index]?.id || t.language_id
          if (langId) {
            initialTitles[langId] = t.title || ''
            initialSeoTitles[langId] = t.seo_title || ''
            initialSeoDescriptions[langId] = t.seo_description || ''
            initialSeoKeywords[langId] = t.seo_keywords || ''
          }
        })
      }

      setTitles(initialTitles)
      setSeoTitles(initialSeoTitles)
      setSeoDescriptions(initialSeoDescriptions)
      setSeoKeywords(initialSeoKeywords)

    } catch (err) {
      console.error('Error fetching blog category:', err)
      setErrorMessage('Failed to load blog category details.')
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

      const payload: any = {
        slug: slug,
        status: status,
        translations: {
          title: {},
          seo_title: {},
          seo_description: {},
          seo_keywords: {}
        }
      }

      languages.forEach(lang => {
        if (titles[lang.id]) payload.translations.title[lang.id] = titles[lang.id]
        if (seoTitles[lang.id]) payload.translations.seo_title[lang.id] = seoTitles[lang.id]
        if (seoDescriptions[lang.id]) payload.translations.seo_description[lang.id] = seoDescriptions[lang.id]
        if (seoKeywords[lang.id]) payload.translations.seo_keywords[lang.id] = seoKeywords[lang.id]
      })

      const response = await fetch(`${apiUrl}/admin/blog-categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to update blog category: ${text}`)
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Blog category updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      navigate('/blog-categories')
    } catch (err) {
      console.error('Error updating blog category:', err)

      let msg = err instanceof Error ? err.message : 'Unknown error'
      try {
        const jsonError = JSON.parse(msg.replace('Failed to update blog category: ', ''))
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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Update Blog Category</h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Modify details of this blog category</p>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>

          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
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
                placeholder="e.g. tech-news"
              />
            </div>

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
                    placeholder="Category title"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>SEO Title ({language.title})</label>
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
                    placeholder="SEO title"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>SEO Description ({language.title})</label>
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
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                    placeholder="SEO description"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>SEO Keywords ({language.title})</label>
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
                    placeholder="keyword1, keyword2"
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
              {submitting ? 'Updating...' : 'Update Blog Category'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/blog-categories')}
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
