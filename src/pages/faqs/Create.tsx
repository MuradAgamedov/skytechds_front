import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Plus } from 'lucide-react'

interface Language {
  id: number
  title: string
  lang_code: string
}

export default function FaqCreate() {
  const navigate = useNavigate()
  const [languages, setLanguages] = useState<Language[]>([])
  const [activeTab, setActiveTab] = useState<number>(0)
  const [status, setStatus] = useState<number>(1)

  const [questions, setQuestions] = useState<Record<number, string>>({})
  const [answers, setAnswers] = useState<Record<number, string>>({})

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setErrorMessage('')

    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const formData = new FormData()

      formData.append('status', status.toString())

      languages.forEach(lang => {
        if (questions[lang.id]) formData.append(`translations[question][${lang.id}]`, questions[lang.id])
        if (answers[lang.id]) formData.append(`translations[answer][${lang.id}]`, answers[lang.id])
      })

      const response = await fetch(`${apiUrl}/admin/faqs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Failed to create FAQ')
      }

      const data = await response.json()
      
      await Swal.fire({
        title: 'Success!',
        text: 'FAQ created successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      navigate('/faqs')

    } catch (err: any) {
      console.error('Error creating FAQ:', err)
      await Swal.fire({
        title: 'Error!',
        text: err.message || 'Failed to create FAQ.',
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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Create FAQ</h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Add a new frequently asked question</p>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Question ({language.title})</label>
                  <input
                    type="text"
                    value={questions[language.id] || ''}
                    onChange={(e) => setQuestions(prev => ({ ...prev, [language.id]: e.target.value }))}
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
                    placeholder="Enter question"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Answer ({language.title})</label>
                  <textarea
                    value={answers[language.id] || ''}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [language.id]: e.target.value }))}
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
                    placeholder="Enter answer"
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
              onClick={() => navigate('/faqs')}
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
                  Create FAQ
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
