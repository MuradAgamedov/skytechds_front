import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Plus, Edit, Trash2 } from 'lucide-react'

interface Language {
  id: number
  title: string
  lang_code: string
}

interface Statistic {
  id: number
  translations: Array<{
    id: number
    title: string
    subtitle: string
    icon_alt_text: string
    statistic_id: number
    language_id: number
  }>
  icon: string | null
  status: number
}

export default function StatisticIndex() {
  const navigate = useNavigate()
  const [statistics, setStatistics] = useState<Statistic[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const [statisticsResponse, languagesResponse] = await Promise.all([
        fetch(`${apiUrl}/admin/statistics`, {
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

      if (!statisticsResponse.ok || !languagesResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const statisticsData = await statisticsResponse.json()
      const languagesData = await languagesResponse.json()

      setStatistics(statisticsData.data || [])
      setLanguages(languagesData.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatisticTitle = (statistic: Statistic) => {
    if (!statistic.translations || statistic.translations.length === 0) return `Statistic ${statistic.id}`
    // Use first translation as title since language_id is not provided
    return statistic.translations[0]?.title || `Statistic ${statistic.id}`
  }

  const getStatisticSubtitle = (statistic: Statistic) => {
    if (!statistic.translations || statistic.translations.length === 0) return ''
    return statistic.translations[0]?.subtitle || ''
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

      const response = await fetch(`${apiUrl}/admin/statistics/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete statistic')
      }

      await Swal.fire({
        title: 'Deleted!',
        text: 'Statistic has been deleted.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      fetchData()
    } catch (err) {
      console.error('Error deleting statistic:', err)
      await Swal.fire({
        title: 'Error!',
        text: 'Failed to delete statistic.',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const filteredStatistics = statistics

  if (loading) {
    return <div style={{ padding: '20px', color: '#f9fafb' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Statistics</h1>
          <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage statistics items</p>
        </div>
        <button
          onClick={() => navigate('/statistics/create')}
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
          Add Statistic
        </button>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tr style={{ backgroundColor: '#374151' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>ID</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Title</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Subtitle</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Icon</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#f9fafb', fontWeight: '500', fontSize: '14px' }}>Actions</th>
            </tr>
            {filteredStatistics.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                  No statistics found.
                </td>
              </tr>
            ) : (
              filteredStatistics.map((statistic) => (
                <tr key={statistic.id} style={{ borderBottom: '1px solid #374151' }}>
                  <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>{statistic.id}</td>
                  <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>
                    {getStatisticTitle(statistic)}
                  </td>
                  <td style={{ padding: '12px', color: '#f9fafb', fontSize: '14px' }}>
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {getStatisticSubtitle(statistic)}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {statistic.icon ? (
                      <img
                        src={statistic.icon}
                        alt="Icon"
                        style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    ) : (
                      <div style={{
                        width: '40px',
                        height: '40px',
                        backgroundColor: '#374151',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: '#6b7280',
                        fontSize: '12px'
                      }}>
                        No icon
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: statistic.status === 1 ? '#10b981' : '#374151',
                        color: '#f9fafb'
                      }}
                    >
                      {statistic.status === 1 ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => navigate(`/statistics/${statistic.id}/edit`)}
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
                      </button>
                      <button
                        onClick={() => handleDelete(statistic.id)}
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
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </table>
        </div>
      </div>
    </div>
  )
}
