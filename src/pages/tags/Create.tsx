import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Plus } from 'lucide-react'

interface Language {
    id: number
    title: string
    lang_code: string
}

export default function TagCreate() {
    const navigate = useNavigate()
    const [languages, setLanguages] = useState<Language[]>([])
    const [activeTab, setActiveTab] = useState<number>(0)

    const [status, setStatus] = useState<boolean>(true)
    const [titles, setTitles] = useState<Record<number, string>>({})

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
        setErrorMessage('')
        setSubmitting(true)

        try {
            const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
            const token = localStorage.getItem('auth_token')

            const payload: any = {
                status: status ? 1 : 0,
                translations: {
                    title: {}
                }
            }

            languages.forEach(lang => {
                if (titles[lang.id]) payload.translations.title[lang.id] = titles[lang.id]
            })

            const response = await fetch(`${apiUrl}/admin/tags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(`Failed to create tag: ${text}`)
            }

            await Swal.fire({
                title: 'Success!',
                text: 'Tag created successfully.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            })

            navigate('/tags')
        } catch (err) {
            console.error('Error creating tag:', err)

            let msg = err instanceof Error ? err.message : 'Unknown error'
            try {
                const jsonError = JSON.parse(msg.replace('Failed to create tag: ', ''))
                if (jsonError.errors) {
                    msg = Object.values(jsonError.errors).flat().join('\n')
                }
            } catch (e) { }

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

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Create Tag</h1>
                <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Add a new tag for blogs</p>
            </div>

            <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
                <form onSubmit={handleSubmit}>

                    <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label style={{ fontWeight: '500', color: '#f9fafb', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <input
                                type="checkbox"
                                checked={status}
                                onChange={(e) => setStatus(e.target.checked)}
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    cursor: 'pointer'
                                }}
                            />
                            Active Status
                        </label>
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
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Title / Keyword ({language.title})</label>
                                    <input
                                        type="text"
                                        value={titles[language.id] || ''}
                                        onChange={(e) => setTitles(prev => ({ ...prev, [language.id]: e.target.value }))}
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
                                        placeholder="Tag name"
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
                            marginBottom: '16px',
                            whiteSpace: 'pre-line'
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
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}
                        >
                            <Plus size={16} />
                            {submitting ? 'Creating...' : 'Create Tag'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/tags')}
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
