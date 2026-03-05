import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Edit, Trash2, Globe } from 'lucide-react'

interface Translation {
  id: number
  address: string
  language_id: number
  address_id: number
}

interface Address {
  id: number
  translations: Translation[]
  status: number | 'active' | 'inactive'
}

interface Language {
  id: number
  title: string
  lang_code: string
}

export default function AddressesIndex() {
  const navigate = useNavigate()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [languages, setLanguages] = useState<Language[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentLanguage, setCurrentLanguage] = useState<number>(3) // Default to Azerbaijani

  useEffect(() => {
    fetchAddresses()
    fetchLanguages()
  }, [])

  const fetchLanguages = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/languages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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

  const fetchAddresses = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/addresses`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch addresses')
      }
      const data = await response.json()
      setAddresses(data.data || [])
      console.log('Addresses data from API:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching addresses:', err)
    } finally {
      setLoading(false)
    }
  }

  const deleteAddress = async (id: number) => {
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
      
      const response = await fetch(`${apiUrl}/admin/addresses/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to delete address')
      }
      
      await Swal.fire({
        title: 'Deleted!',
        text: 'Address has been deleted.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })
      
      // Refresh the addresses list
      fetchAddresses()
    } catch (err) {
      await Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to delete address',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
      setError(err instanceof Error ? err.message : 'Failed to delete address')
      console.error('Error deleting address:', err)
    }
  }

  const getTranslationForLanguage = (address: Address, languageId: number) => {
    const translation = address.translations.find(t => t.language_id === languageId)
    return translation ? translation.address : 'No translation'
  }

  const getLanguageName = (languageId: number) => {
    const language = languages.find(l => l.id === languageId)
    return language ? language.title : `Language ${languageId}`
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Addresses</h1>
        <button 
          onClick={() => navigate('/addresses/create')}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
        >
          Create New Address
        </button>
      </div>

      {/* Language Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>
          Display Language:
        </label>
        <select
          value={currentLanguage}
          onChange={(e) => setCurrentLanguage(Number(e.target.value))}
          style={{
            padding: '8px 12px',
            border: '1px solid #4b5563',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: '#374151',
            color: '#f9fafb',
            minWidth: '200px'
          }}
        >
          {languages.map(language => (
            <option key={language.id} value={language.id}>
              {language.title}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
          Loading addresses...
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
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '40%' }}>Address</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '20%' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '40%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((address) => (
                <tr key={address.id} style={{ backgroundColor: '#1f2937' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb', width: '40%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Globe size={16} style={{ color: '#6b7280' }} />
                      <span>{getTranslationForLanguage(address, currentLanguage)}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {languages.slice(0, 2).map(lang => (
                        <span key={lang.id} style={{ marginRight: '12px' }}>
                          {getTranslationForLanguage(address, lang.id)}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', width: '20%' }}>
                    <span 
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: (address.status === 1 || address.status === 'active') ? '#10b981' : '#ef4444',
                        color: 'white'
                      }}
                    >
                      {(address.status === 1 || address.status === 'active') ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', width: '40%' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                      <button 
                        onClick={() => navigate(`/addresses/update/${address.id}`)}
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
                        onClick={() => deleteAddress(address.id)}
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

      {!loading && !error && addresses.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
          No addresses found. Create your first address!
        </div>
      )}
    </div>
  )
}
