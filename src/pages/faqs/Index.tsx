import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface Language {
  id: number
  title: string
  lang_code: string
}

interface Faq {
  id: number
  translations: Array<{
    id: number
    question: string
    answer: string
    faq_id: number
    language_id: number
  }>
  status: number
}

export default function FaqIndex() {
  const navigate = useNavigate()
  const [faqs, setFaqs] = useState<Faq[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const [faqsResponse, languagesResponse] = await Promise.all([
        fetch(`${apiUrl}/admin/faqs`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }),
        fetch(`${apiUrl}/admin/languages`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
      ])

      if (!faqsResponse.ok || !languagesResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const faqsData = await faqsResponse.json()
      const languagesData = await languagesResponse.json()

      setFaqs(faqsData.data || [])
      setLanguages(languagesData.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getFaqQuestion = (faq: Faq) => {
    if (!faq.translations || faq.translations.length === 0) return `FAQ ${faq.id}`
    // Use first translation as question since language_id is not provided
    return faq.translations[0]?.question || `FAQ ${faq.id}`
  }

  const getFaqAnswer = (faq: Faq) => {
    if (!faq.translations || faq.translations.length === 0) return ''
    return faq.translations[0]?.answer || ''
  }

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    })

    if (!result.isConfirmed) return

    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/admin/faqs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete FAQ')
      }

      await Swal.fire({
        title: 'Deleted!',
        text: 'FAQ has been deleted.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      fetchData()
    } catch (err) {
      console.error('Error deleting FAQ:', err)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete FAQ.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const filteredFaqs = faqs

  if (loading) {
    return <div style={{ padding: '20px', color: '#f9fafb' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>FAQs</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage frequently asked questions</p>
        </div>
        <button
          onClick={() => navigate('/faqs/create')}
          style={{
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            backgroundColor: '#3b82f6',
            color: '#f9fafb',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={16} />
          Add FAQ
        </button>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#374151' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Question</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Answer</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaqs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    No FAQs found.
                  </td>
                </tr>
              ) : (
                filteredFaqs.map((faq) => (
                  <tr key={faq.id} style={{ borderBottom: '1px solid #374151' }}>
                    <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>{faq.id}</td>
                    <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>
                      {getFaqQuestion(faq)}
                    </td>
                    <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>
                      <div style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getFaqAnswer(faq)}
                      </div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: faq.status === 1 ? '#10b981' : '#374151',
                          color: '#f9fafb'
                        }}
                      >
                        {faq.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => navigate(`/faqs/${faq.id}/edit`)}
                          style={{
                            padding: '6px 8px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            backgroundColor: '#3b82f6',
                            color: '#f9fafb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Edit size={12} />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(faq.id)}
                          style={{
                            padding: '6px 8px',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            backgroundColor: '#ef4444',
                            color: '#f9fafb',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
