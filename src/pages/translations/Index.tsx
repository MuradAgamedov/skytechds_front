import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Edit, Trash2, Globe } from 'lucide-react'

interface TranslationValue {
    id: number
    value: string
    language_id: number
    translation_id: number
}

interface TranslationItem {
    id: number
    keyword?: string // Dictionary API uses 'keyword'
    key?: string     // Fallback just in case
    translations: TranslationValue[]
}

interface Language {
    id: number
    title: string
    lang_code: string
}

export default function TranslationsIndex() {
    const navigate = useNavigate()
    const [translations, setTranslations] = useState<TranslationItem[]>([])
    const [languages, setLanguages] = useState<Language[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [currentLanguage, setCurrentLanguage] = useState<number>(3)

    useEffect(() => {
        fetchLanguages()
        fetchTranslations()
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

    const fetchTranslations = async () => {
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
                throw new Error('Failed to fetch translations')
            }
            const data = await response.json()
            setTranslations(data.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            console.error('Error fetching translations:', err)
        } finally {
            setLoading(false)
        }
    }

    const deleteTranslation = async (id: number) => {
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
                throw new Error('Failed to delete translation')
            }

            await Swal.fire({
                title: 'Deleted!',
                text: 'Translation has been deleted.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            })

            fetchTranslations()
        } catch (err) {
            await Swal.fire({
                title: 'Error!',
                text: err instanceof Error ? err.message : 'Failed to delete translation',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            })
            setError(err instanceof Error ? err.message : 'Failed to delete translation')
        }
    }

    const getTranslationForLanguage = (translation: TranslationItem, languageId: number) => {
        if (!translation.translations) return 'No translation'
        const trans = translation.translations.find(t => t.language_id === languageId)
        return trans ? trans.value : 'No translation'
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Translations</h1>
                <button
                    onClick={() => navigate('/translations/create')}
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer'
                    }}
                >
                    Create New Translation
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
                    Loading translations...
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
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '30%' }}>Keyword</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '50%' }}>Value</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '20%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {translations.map((translation) => (
                                <tr key={translation.id} style={{ backgroundColor: '#1f2937' }}>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                                        <div style={{ fontWeight: 500 }}>{translation.keyword || translation.key || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Globe size={16} style={{ color: '#6b7280' }} />
                                            <span>{getTranslationForLanguage(translation, currentLanguage)}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151' }}>
                                        <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                                            <button
                                                onClick={() => navigate(`/translations/update/${translation.id}`)}
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
                                                onClick={() => deleteTranslation(translation.id)}
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

            {!loading && !error && translations.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
                    No translations found. Create your first translation!
                </div>
            )}
        </div>
    )
}
