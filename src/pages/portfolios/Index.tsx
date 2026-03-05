import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Edit, Trash2, Plus, Eye } from 'lucide-react'

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
  }>
  status: number | null
  card_image: string | null
  url: string | null
}

export default function PortfolioIndex() {
  const navigate = useNavigate()
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const [portfoliosRes, languagesRes] = await Promise.all([
        fetch(`${apiUrl}/admin/portfolios`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${apiUrl}/admin/languages`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (portfoliosRes.ok) {
        const portfoliosData = await portfoliosRes.json()
        setPortfolios(portfoliosData.data || [])
      }

      if (languagesRes.ok) {
        const languagesData = await languagesRes.json()
        setLanguages(languagesData.data || [])
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPortfolioTitle = (portfolio: Portfolio) => {
    if (!portfolio.translations || portfolio.translations.length === 0) return `Portfolio ${portfolio.id}`
    // Use first translation as title since language_id is not provided
    return portfolio.translations[0]?.title || `Portfolio ${portfolio.id}`
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
      
      const response = await fetch(`${apiUrl}/admin/portfolios/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete portfolio')
      }

      await Swal.fire({
        title: 'Deleted!',
        text: 'Portfolio has been deleted.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      fetchData()
    } catch (err) {
      console.error('Error deleting portfolio:', err)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete portfolio.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const filteredPortfolios = portfolios

  if (loading) {
    return <div style={{ padding: '20px', color: '#f9fafb' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Portfolios</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage portfolio items</p>
        </div>
        <button
          onClick={() => navigate('/portfolios/create')}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
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
          <Plus size={16} />
          Add Portfolio
        </button>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#374151' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>ID</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Title</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>URL</th>
                <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Image</th>
                <th style={{ padding: '12px', textAlign: 'center', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPortfolios.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                    No portfolios found.
                  </td>
                </tr>
              ) : (
                filteredPortfolios.map((portfolio) => (
                  <tr key={portfolio.id} style={{ borderBottom: '1px solid #374151' }}>
                    <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>{portfolio.id}</td>
                    <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>
                      {getPortfolioTitle(portfolio)}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: portfolio.status === 1 ? '#10b981' : '#ef4444',
                          color: 'white'
                        }}
                      >
                        {portfolio.status === 1 ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>
                      {portfolio.url ? (
                        <a
                          href={portfolio.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: '#3b82f6', textDecoration: 'none' }}
                        >
                          {portfolio.url.length > 30 ? `${portfolio.url.substring(0, 30)}...` : portfolio.url}
                        </a>
                      ) : (
                        <span style={{ color: '#6b7280' }}>No URL</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      {portfolio.card_image ? (
                        <img
                          src={portfolio.card_image}
                          alt={getPortfolioTitle(portfolio)}
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                          onError={(e) => {
                            const target = e.currentTarget
                            target.style.display = 'none'
                            target.parentElement!.innerHTML = '<span style="color: #6b7280; font-size: 12px;">No image</span>'
                          }}
                        />
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '12px' }}>No image</span>
                      )}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button
                          onClick={() => navigate(`/portfolios/${portfolio.id}/edit`)}
                          style={{
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(portfolio.id)}
                          style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                          title="Delete"
                        >
                          <Trash2 size={14} />
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
