import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

interface TranslationValue {
    id: number
    text: string
    image_alt_text: string | null
    language_id: number
}

interface Language {
    id: number
    title: string
    lang_code: string
}

export default function AboutUpdate() {
    const navigate = useNavigate()
    const [languages, setLanguages] = useState<Language[]>([])
    const [activeTab, setActiveTab] = useState<number>(0)

    // Store translations keyed by language_id
    const [texts, setTexts] = useState<Record<number, string>>({})
    const [altTexts, setAltTexts] = useState<Record<number, string>>({})

    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [imageFile, setImageFile] = useState<File | null>(null)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        fetchLanguages().then(langs => {
            if (langs) fetchAbout(langs)
        })
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
            const langs = data.data || []
            setLanguages(langs)
            return langs
        } catch (err) {
            console.error('Error fetching languages:', err)
            return null
        }
    }

    const fetchAbout = async (currentLangs: Language[]) => {
        try {
            const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
            const token = localStorage.getItem('auth_token')
            const res = await fetch(`${apiUrl}/admin/about`, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            })
            if (!res.ok) throw new Error('Failed to fetch About data')
            const json = await res.json()
            const aboutData = json.data

            if (aboutData.image) {
                setImagePreview(aboutData.image)
            }

            const initialTexts: Record<number, string> = {}
            const initialAltTexts: Record<number, string> = {}

            // Map translations by array index to language ID
            if (aboutData.translations && currentLangs) {
                aboutData.translations.forEach((t: any, index: number) => {
                    const langId = currentLangs[index]?.id
                    if (langId) {
                        initialTexts[langId] = t.text || ''
                        initialAltTexts[langId] = t.image_alt_text || ''
                    }
                })
            }

            setTexts(initialTexts)
            setAltTexts(initialAltTexts)
        } catch (err) {
            console.error('Error loading about:', err)
            setErrorMessage('Failed to load about details.')
        } finally {
            setLoading(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage('')
        setSubmitting(true)

        try {
            const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
            const token = localStorage.getItem('auth_token')

            const formData = new FormData()
            // Important: passing _method=PUT to mock PUT request with multipart/form-data
            formData.append('_method', 'PUT')

            if (imageFile) {
                formData.append('image', imageFile)
            }

            // Structured to match backend expecting translations[field][id]
            languages.forEach(lang => {
                // If text exists and is not empty, append it. Otherwise if backend requires it dynamically, we might still fail if left totally empty, but typically backend allows partial translation array drops.
                if (texts[lang.id]) {
                    formData.append(`translations[text][${lang.id}]`, texts[lang.id] || '')
                }
                if (altTexts[lang.id]) {
                    formData.append(`translations[image_alt_text][${lang.id}]`, altTexts[lang.id] || '')
                }
            })

            const response = await fetch(`${apiUrl}/admin/about/1`, {
                method: 'POST', // Use POST for FormData with _method override
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(`Failed to update about details: ${response.status} ${text}`)
            }

            await Swal.fire({
                title: 'Success!',
                text: 'About details updated successfully.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            })

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error'
            console.error('Error updating about:', msg)
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

    const handleTextChange = (languageId: number, value: string) => {
        setTexts(prev => ({ ...prev, [languageId]: value }))
    }

    const handleAltTextChange = (languageId: number, value: string) => {
        setAltTexts(prev => ({ ...prev, [languageId]: value }))
    }

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Update About Content</h1>
                <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage the "About Us" section details and image</p>
            </div>

            <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
                <form onSubmit={handleSubmit}>

                    {/* Image Upload */}
                    <div style={{ marginBottom: '24px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>About Image</label>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                            {imagePreview && (
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    backgroundColor: '#374151',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    border: '1px solid #4b5563',
                                    position: 'relative'
                                }}>
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        style={{ 
                                            maxWidth: '100%', 
                                            maxHeight: '100%', 
                                            objectFit: 'cover',
                                            width: '100%',
                                            height: '100%'
                                        }}
                                        onError={(e) => { 
                                            const target = e.currentTarget
                                            target.style.display = 'none'
                                            target.parentElement!.innerHTML = '<div style="color: #6b7280; font-size: 12px; text-align: center; padding: 10px;">Image not available</div>'
                                        }}
                                    />
                                    {/* Remove button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setImagePreview(null)
                                            setImageFile(null)
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '4px',
                                            right: '4px',
                                            backgroundColor: '#ef4444',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '20px',
                                            height: '20px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '8px',
                                        color: '#f9fafb',
                                        border: '1px dashed #4b5563',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        backgroundColor: '#374151'
                                    }}
                                />
                                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                                    Leave empty to keep existing image.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
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

                    {/* Tab Content */}
                    <div style={{ marginBottom: '24px' }}>
                        {languages.map((language, index) => (
                            <div key={language.id} style={{ display: activeTab === index ? 'block' : 'none' }}>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>
                                        Image Alt Text ({language.title})
                                    </label>
                                    <input
                                        type="text"
                                        value={altTexts[language.id] || ''}
                                        onChange={(e) => handleAltTextChange(language.id, e.target.value)}
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
                                        placeholder={`Enter alt text in ${language.title}`}
                                    />
                                </div>

                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>
                                        About Text ({language.title})
                                    </label>
                                    <textarea
                                        value={texts[language.id] || ''}
                                        onChange={(e) => handleTextChange(language.id, e.target.value)}
                                        rows={6}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px',
                                            border: '1px solid #4b5563',
                                            borderRadius: '6px',
                                            fontSize: '14px',
                                            backgroundColor: '#374151',
                                            color: '#f9fafb',
                                            resize: 'vertical',
                                            boxSizing: 'border-box'
                                        }}
                                        placeholder={`Enter text in ${language.title}`}
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
                            {submitting ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
