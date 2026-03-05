import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

interface Language {
    id: number
    title: string
    lang_code: string
}

export default function TranslationCreate() {
    const navigate = useNavigate()
    const [languages, setLanguages] = useState<Language[]>([])
    const [activeTab, setActiveTab] = useState<number>(0)
    const [formData, setFormData] = useState({
        key: '',
        translations: {} as Record<number, string>
    })

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

            const initialTranslations: Record<number, string> = {}
            data.data?.forEach((lang: Language) => {
                initialTranslations[lang.id] = ''
            })
            setFormData(prev => ({ ...prev, translations: initialTranslations }))
        } catch (err) {
            console.error('Error fetching languages:', err)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage('')
        setSubmitting(true)

        try {
            const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
            const token = localStorage.getItem('auth_token')

            const payload = {
                status: 1, // Defaulting to active
                order: 1,  // Defaulting to 1
                keyword: formData.key,
                translations: {
                    value: formData.translations
                }
            }

            const response = await fetch(`${apiUrl}/admin/dictionaries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(`Failed to create translation: ${response.status} ${text}`)
            }

            await Swal.fire({
                title: 'Success!',
                text: 'Translation created successfully.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            })

            navigate('/translations')
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error'
            console.error('Error creating translation:', msg)
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

    const handleTabChange = (index: number) => {
        setActiveTab(index)
    }

    const handleTranslationChange = (languageId: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            translations: {
                ...prev.translations,
                [languageId]: value
            }
        }))
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Create Translation</h1>
                <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Add new multilingual translation key and values</p>
            </div>

            <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
                <form onSubmit={handleSubmit}>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Key</label>
                        <input
                            type="text"
                            value={formData.key}
                            onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                            required
                            style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #4b5563',
                                borderRadius: '6px',
                                backgroundColor: '#374151',
                                color: '#f9fafb',
                                boxSizing: 'border-box'
                            }}
                            placeholder="e.g. welcome_message"
                        />
                    </div>

                    {/* Tabs */}
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', borderBottom: '1px solid #374151' }}>
                            {languages.map((language, index) => (
                                <button
                                    key={language.id}
                                    type="button"
                                    onClick={() => handleTabChange(index)}
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

                    {/* Tab Content */}
                    <div style={{ marginBottom: '24px' }}>
                        {languages.map((language, index) => (
                            <div key={language.id} style={{ display: activeTab === index ? 'block' : 'none' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>
                                    Value ({language.title})
                                </label>
                                <textarea
                                    value={formData.translations[language.id] || ''}
                                    onChange={(e) => handleTranslationChange(language.id, e.target.value)}
                                    required
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        padding: '8px 12px',
                                        border: '1px solid #4b5563',
                                        borderRadius: '6px',
                                        fontSize: '14px',
                                        backgroundColor: '#374151',
                                        color: '#f9fafb',
                                        resize: 'vertical',
                                        minHeight: '100px',
                                        boxSizing: 'border-box'
                                    }}
                                    placeholder={`Enter value in ${language.title}`}
                                />
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
                                fontWeight: '500'
                            }}
                        >
                            {submitting ? 'Creating…' : 'Create Translation'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/translations')}
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
