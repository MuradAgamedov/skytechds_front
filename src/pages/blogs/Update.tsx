import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Edit } from 'lucide-react'

interface Language {
  id: number
  title: string
  lang_code: string
}

interface BlogCategory {
  id: number
  slug: string
  translations: Array<{
    title: string
    language_id: number
  }>
}

interface BlogTag {
  id: number
  translations: Array<{
    id: number
    title: string
  }>
  status: number
}

export default function BlogUpdate() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [languages, setLanguages] = useState<Language[]>([])
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<number>(0)

  const [slug, setSlug] = useState('')
  const [order, setOrder] = useState<number>(0)
  const [blogCategoryId, setBlogCategoryId] = useState<string>('')

  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [titles, setTitles] = useState<Record<number, string>>({})
  const [descriptions, setDescriptions] = useState<Record<number, string>>({})
  const [seoTitles, setSeoTitles] = useState<Record<number, string>>({})
  const [seoDescriptions, setSeoDescriptions] = useState<Record<number, string>>({})
  const [seoKeywords, setSeoKeywords] = useState<Record<number, string>>({})
  const [cardImageAltTexts, setCardImageAltTexts] = useState<Record<number, string>>({})

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchLanguages()
      .then(() => fetchCategories())
      .then(() => fetchTags())
      .then(() => fetchBlog())
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

  const fetchCategories = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${apiUrl}/admin/blog-categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setCategories(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchTags = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${apiUrl}/admin/tags`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setTags(data.data || [])
      }
    } catch (err) {
      console.error('Error fetching tags:', err)
    }
  }

  const fetchBlog = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`${apiUrl}/admin/blogs/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) throw new Error('Failed to fetch blog details')
      const data = await response.json()
      const blog = data.data

      setSlug(blog.slug || '')
      setOrder(blog.order || 0)
      if (blog.blog_category_id) setBlogCategoryId(String(blog.blog_category_id))
      if (blog.card_image) setImagePreview(blog.card_image)

      const initialTitles: Record<number, string> = {}
      const initialDescriptions: Record<number, string> = {}
      const initialSeoTitles: Record<number, string> = {}
      const initialSeoDescriptions: Record<number, string> = {}
      const initialSeoKeywords: Record<number, string> = {}
      const initialCardImageAltTexts: Record<number, string> = {}
      const initialSelectedTags: string[] = []

      if (blog.tags && Array.isArray(blog.tags)) {
        blog.tags.forEach((tag: any) => {
          if (tag.id) {
            initialSelectedTags.push(tag.id.toString())
          }
        })
      }
      setSelectedTags(initialSelectedTags)

      if (blog.translations && Array.isArray(blog.translations)) {
        blog.translations.forEach((t: any) => {
          if (t.language_id) {
            initialTitles[t.language_id] = t.title || ''
            initialDescriptions[t.language_id] = t.description || ''
            initialSeoTitles[t.language_id] = t.seo_title || ''
            initialSeoDescriptions[t.language_id] = t.seo_description || ''
            initialSeoKeywords[t.language_id] = t.seo_keywords || ''
            initialCardImageAltTexts[t.language_id] = t.card_image_alt_text || ''
          }
        })
      }

      setTitles(initialTitles)
      setDescriptions(initialDescriptions)
      setSeoTitles(initialSeoTitles)
      setSeoDescriptions(initialSeoDescriptions)
      setSeoKeywords(initialSeoKeywords)
      setCardImageAltTexts(initialCardImageAltTexts)

    } catch (err) {
      console.error('Error fetching blog:', err)
      setErrorMessage('Failed to load blog details.')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
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
      formData.append('_method', 'PUT')
      formData.append('slug', slug)
      formData.append('order', order.toString())

      if (blogCategoryId) {
        formData.append('blog_category_id', blogCategoryId)
      }

      if (imageFile) {
        formData.append('card_image', imageFile)
      }

      selectedTags.forEach((tagId, index) => {
        formData.append(`tags[${index}]`, tagId)
      })

      languages.forEach(lang => {
        formData.append(`translations[title][${lang.id}]`, titles[lang.id] || '')
        formData.append(`translations[description][${lang.id}]`, descriptions[lang.id] || '')
        formData.append(`translations[seo_title][${lang.id}]`, seoTitles[lang.id] || '')
        formData.append(`translations[seo_description][${lang.id}]`, seoDescriptions[lang.id] || '')
        formData.append(`translations[seo_keywords][${lang.id}]`, seoKeywords[lang.id] || '')
        formData.append(`translations[card_image_alt_text][${lang.id}]`, cardImageAltTexts[lang.id] || '')
      })

      const response = await fetch(`${apiUrl}/admin/blogs/${id}`, {
        method: 'POST', // Using POST with _method=PUT to support FormData
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(`Failed to update blog: ${text}`)
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Blog updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      navigate('/blogs')
    } catch (err) {
      console.error('Error updating blog:', err)

      let msg = err instanceof Error ? err.message : 'Unknown error'
      try {
        const jsonError = JSON.parse(msg.replace('Failed to update blog: ', ''))
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

  const getTagTitle = (tag: BlogTag) => {
    if (!tag.translations || tag.translations.length === 0) return `Tag ${tag.id}`
    const azTitle = tag.translations.find(t => t.id === 1)?.title
    const enTitle = tag.translations.find(t => t.id === 2)?.title
    return azTitle || enTitle || tag.translations[0]?.title || `Tag ${tag.id}`
  }

  const getCategoryTitle = (category: BlogCategory) => {
    if (!category.translations) return category.slug
    const azTitle = category.translations.find(t => t.language_id === 3)?.title
    const enTitle = category.translations.find(t => t.language_id === 4)?.title
    return azTitle || enTitle || category.slug
  }

  if (loading) {
    return <div style={{ padding: '20px', color: '#f9fafb' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Update Blog</h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Modify an existing blog post</p>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
            <div>
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
                placeholder="e.g. latest-tech-trends"
              />
            </div>

           
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Category</label>
              <select
                value={blogCategoryId}
                onChange={(e) => setBlogCategoryId(e.target.value)}
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
              >
                <option value="">Select Category (Optional)</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{getCategoryTitle(cat)} (ID: {cat.id})</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Tags</label>
              <select
                multiple
                value={selectedTags}
                onChange={(e) => setSelectedTags(Array.from(e.target.selectedOptions, option => option.value))}
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
              >
                <option value="" disabled>Select Tags (Optional)</option>
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id.toString()}>{getTagTitle(tag)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Image Upload */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Card Image</label>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              {imagePreview && (
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
                    src={imagePreview}
                    alt="Preview"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      const target = e.currentTarget
                      target.style.display = 'none'
                      target.parentElement!.innerHTML = '<div style="color: #6b7280; font-size: 12px; text-align: center; padding: 10px;">Image not available</div>'
                    }}
                  />
                  {/* Remove button */}
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      setImageFile(null)
                    }}
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
                  onChange={handleImageChange}
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
                    placeholder="Blog title"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Description ({language.title})</label>
                  <textarea
                    value={descriptions[language.id] || ''}
                    onChange={(e) => setDescriptions(prev => ({ ...prev, [language.id]: e.target.value }))}
                    rows={6}
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
                    placeholder="Main blog content"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Card Image Alt Text ({language.title})</label>
                  <input
                    type="text"
                    value={cardImageAltTexts[language.id] || ''}
                    onChange={(e) => setCardImageAltTexts(prev => ({ ...prev, [language.id]: e.target.value }))}
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
                    placeholder="Alt text for the image"
                  />
                </div>

                <hr style={{ borderColor: '#374151', margin: '24px 0' }} />

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
              {submitting ? 'Updating...' : 'Update Blog'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/blogs')}
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
