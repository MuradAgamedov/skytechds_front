import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Edit, Trash2, Globe } from 'lucide-react'

interface Translation {
    id: number
    value: string
    language_id: number
    dictionary_id: number
}

interface Dictionary {
    id: number
    keyword: string
    translations: Translation[]
}

interface Language {
    id: number
    title: string
    lang_code: string
}

export default function DictionariesIndex() {
    const navigate = useNavigate()
    const [dictionaries, setDictionaries] = useState<Dictionary[]>([])
    const [languages, setLanguages] = useState<Language[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentLanguage, setCurrentLanguage] = useState<number>(3) // Default to Azerbaijani if available

    useEffect(() => {
        fetchLanguages()
        fetchDictionaries()
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
            if (data.data?.length > 0) {
                setCurrentLanguage(data.data[0].id)
            }
        } catch (err) {
            console.error('Error fetching languages:', err)
        }
    }

    const fetchDictionaries = async () => {
        try {
            const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
            const token = localStorage.getItem('auth_token')

            const response = await fetch(`${apiUrl}/admin/dictionaries`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch dictionaries')
            }
            const data = await response.json()
            setDictionaries(data.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            console.error('Error fetching dictionaries:', err)
        } finally {
            setLoading(false)
        }
    }

    const deleteDictionary = async (id: number) => {
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

            const response = await fetch(`${apiUrl}/admin/dictionaries/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to delete dictionary entry')
            }

            await Swal.fire({
                title: 'Deleted!',
                text: 'Dictionary entry has been deleted.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            })

            fetchDictionaries()
        } catch (err) {
            await Swal.fire({
                title: 'Error!',
                text: err instanceof Error ? err.message : 'Failed to delete dictionary entry',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            })
            setError(err instanceof Error ? err.message : 'Failed to delete dictionary entry')
        }
    }

    const getTranslationForLanguage = (dictionary: Dictionary, languageId: number) => {
        if (!dictionary.translations) return 'No translation'
        const translation = dictionary.translations.find(t => t.language_id === languageId)
        return translation ? translation.value : 'No translation'
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Dictionary</h1>
                <button
                    onClick={() => navigate('/dictionaries/create')}
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer'
                    }}
                >
                    Create New Entry
                </button>
            </div>

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
                    Loading dictionaries...
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
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '35%' }}>Keyword</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '45%' }}>Value</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '20%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dictionaries.map((dictionary) => (
                                <tr key={dictionary.id} style={{ backgroundColor: '#1f2937' }}>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                                        <div style={{ fontWeight: 500 }}>{dictionary.keyword}</div>
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Globe size={16} style={{ color: '#6b7280' }} />
                                            <span>{getTranslationForLanguage(dictionary, currentLanguage)}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                                        {dictionary.order}
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151' }}>
                                        <span
                                            style={{
                                                padding: '4px 8px',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                backgroundColor: (dictionary.status === 1 || dictionary.status === true || dictionary.status === 'active') ? '#10b981' : '#ef4444',
                                                color: 'white'
                                            }}
                                        >
                                            {(dictionary.status === 1 || dictionary.status === true || dictionary.status === 'active') ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                                            <button
                                                onClick={() => navigate(`/dictionaries/update/${dictionary.id}`)}
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
                                                onClick={() => deleteDictionary(dictionary.id)}
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

            {!loading && !error && dictionaries.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
                    No entries found. Create your first dictionary entry!
                </div>
            )}
        </div>
    )
}
