import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Edit, Trash2 } from 'lucide-react'

interface Map {
  id: number
  map: string
  status: number | string | 'active' | 'inactive'
}

export default function MapsIndex() {
  const navigate = useNavigate()
  const [maps, setMaps] = useState<Map[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMaps()
  }, [])

  const fetchMaps = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/maps`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch maps')
      }
      const data = await response.json()
      // API returns object with data array inside
      setMaps(data.data || [])
      console.log('Maps data from API:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching maps:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteMap = async (id: number) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    })

    if (!result.isConfirmed) return

    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/maps/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to delete map')
      }
      
      await Swal.fire({
        title: 'Deleted!',
        text: 'Map has been deleted.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })
      
      // Refresh the maps list
      fetchMaps()
    } catch (err) {
      await Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to delete map',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
      setError(err instanceof Error ? err.message : 'Failed to delete map')
      console.error('Error deleting map:', err)
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Maps</h1>
        <button 
          onClick={() => navigate('/maps/create')}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Create New Map
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
          Loading maps...
        </div>
      )}

      {error && (
        <div style={{ 
          backgroundColor: '#ef4444', 
          color: 'white', 
          padding: '12px', 
          borderRadius: '6px', 
          marginBottom: '20px',
          textAlign: 'center'
        }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && (
        <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#374151' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '50%' }}>Map</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '20%' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '30%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maps.map((map) => (
                <tr key={map.id} style={{ backgroundColor: '#1f2937' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', width: '50%' }}>
                    <div 
                      style={{ 
                        maxWidth: '400px',
                        borderRadius: '8px', 
                        overflow: 'hidden',
                        border: '1px solid #4b5563'
                      }}
                      dangerouslySetInnerHTML={{ __html: map.map }}
                    />
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', width: '20%' }}>
                    <span 
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: (map.status === 1 || map.status === 'active' || map.status === 'true') ? '#10b981' : '#ef4444',
                        color: 'white'
                      }}
                    >
                      {(map.status === 1 || map.status === 'active' || map.status === 'true') ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', width: '30%' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                      <button 
                        onClick={() => navigate(`/maps/update/${map.id}`)}
                        style={{
                          backgroundColor: '#f59e0b',
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
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => deleteMap(map.id)}
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
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && !error && maps.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
          No maps found. Create your first map!
        </div>
      )}
    </div>
  )
}
