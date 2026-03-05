import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

interface Language {
    id: number
    title: string
    lang_code: string
}

export default function DictionaryCreate() {
    const navigate = useNavigate()
    const [languages, setLanguages] = useState<Language[]>([])
    const [activeTab, setActiveTab] = useState<number>(0)
    const [formData, setFormData] = useState({
        keyword: '',
        order: 1,
        translations: {} as Record<number, string>,
        status: true as boolean
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
                status: formData.status,
                order: formData.order,
                keyword: formData.keyword,
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
                throw new Error(`Failed to create dictionary: ${response.status} ${text}`)
            }

            await Swal.fire({
                title: 'Success!',
                text: 'Dictionary entry has been created successfully.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            })

            navigate('/dictionaries')
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error'
            console.error('Error creating dictionary:', msg)
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
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Create Dictionary Entry</h1>
                <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Add new multilingual dictionary keyword and values</p>
            </div>

            <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
                <form onSubmit={handleSubmit}>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Keyword</label>
                        <input
                            type="text"
                            value={formData.keyword}
                            onChange={(e) => setFormData(prev => ({ ...prev, keyword: e.target.value }))}
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
                            placeholder="e.g. footer_address"
                        />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Order</label>
                        <input
                            type="number"
                            value={formData.order}
                            onChange={(e) => setFormData(prev => ({ ...prev, order: Number(e.target.value) }))}
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

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500', color: '#f9fafb' }}>Status</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ color: !formData.status ? '#ef4444' : '#6b7280', fontSize: '14px' }}>Inactive</span>
                            <label style={{
                                position: 'relative',
                                display: 'inline-block',
                                width: '50px',
                                height: '24px',
                                cursor: 'pointer'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.checked }))}
                                    style={{ opacity: 0, width: 0, height: 0 }}
                                />
                                <span style={{
                                    position: 'absolute',
                                    cursor: 'pointer',
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    backgroundColor: formData.status ? '#10b981' : '#374151',
                                    transition: '.4s',
                                    borderRadius: '24px',
                                    border: `1px solid ${formData.status ? '#10b981' : '#4b5563'}`
                                }}>
                                    <span style={{
                                        position: 'absolute',
                                        content: '""',
                                        height: '16px',
                                        width: '16px',
                                        left: formData.status ? '26px' : '3px',
                                        bottom: '3px',
                                        backgroundColor: 'white',
                                        transition: '.4s',
                                        borderRadius: '50%'
                                    }} />
                                </span>
                            </label>
                            <span style={{ color: formData.status ? '#10b981' : '#6b7280', fontSize: '14px' }}>Active</span>
                        </div>
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
                            {submitting ? 'Creating…' : 'Create Entry'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/dictionaries')}
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
