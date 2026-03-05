import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Plus, X } from 'lucide-react'

interface Language {
    id: number
    title: string
    lang_code: string
}

export default function ServiceCreate() {
    const navigate = useNavigate()
    const [languages, setLanguages] = useState<Language[]>([])
    const [activeTab, setActiveTab] = useState<number>(0)

    const [order, setOrder] = useState<number>(0)

    const [icon, setIcon] = useState<File | null>(null)
    const [iconPreview, setIconPreview] = useState<string>('')

    const [innerImage, setInnerImage] = useState<File | null>(null)
    const [innerImagePreview, setInnerImagePreview] = useState<string>('')

    const [titles, setTitles] = useState<Record<number, string>>({})
    const [descriptions, setDescriptions] = useState<Record<number, string>>({})
    const [cardTitles, setCardTitles] = useState<Record<number, string>>({})
    const [iconAltTexts, setIconAltTexts] = useState<Record<number, string>>({})
    const [innerImageAltTexts, setInnerImageAltTexts] = useState<Record<number, string>>({})
    const [seoTitles, setSeoTitles] = useState<Record<number, string>>({})
    const [seoDescriptions, setSeoDescriptions] = useState<Record<number, string>>({})
    const [seoKeywords, setSeoKeywords] = useState<Record<number, string>>({})

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

    const handleImageChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPreview: React.Dispatch<React.SetStateAction<string>>
    ) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            setFile(file)

            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const removeImage = (
        setFile: React.Dispatch<React.SetStateAction<File | null>>,
        setPreview: React.Dispatch<React.SetStateAction<string>>
    ) => {
        setFile(null)
        setPreview('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setErrorMessage('')
        setSubmitting(true)

        try {
            const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
            const token = localStorage.getItem('auth_token')

            const formData = new FormData()

            formData.append('order', order.toString())

            if (icon) {
                formData.append('icon', icon)
            }
            if (innerImage) {
                formData.append('inner_image', innerImage)
            }

            languages.forEach(lang => {
                if (titles[lang.id]) formData.append(`translations[title][${lang.id}]`, titles[lang.id])
                if (descriptions[lang.id]) formData.append(`translations[description][${lang.id}]`, descriptions[lang.id])
                if (cardTitles[lang.id]) formData.append(`translations[card_title][${lang.id}]`, cardTitles[lang.id])
                if (iconAltTexts[lang.id]) formData.append(`translations[icon_alt_text][${lang.id}]`, iconAltTexts[lang.id])
                if (innerImageAltTexts[lang.id]) formData.append(`translations[inner_image_alt_text][${lang.id}]`, innerImageAltTexts[lang.id])
                if (seoTitles[lang.id]) formData.append(`translations[seo_title][${lang.id}]`, seoTitles[lang.id])
                if (seoDescriptions[lang.id]) formData.append(`translations[seo_description][${lang.id}]`, seoDescriptions[lang.id])
                if (seoKeywords[lang.id]) formData.append(`translations[seo_keywords][${lang.id}]`, seoKeywords[lang.id])
            })

            const response = await fetch(`${apiUrl}/admin/services`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(`Failed to create service: ${text}`)
            }

            await Swal.fire({
                title: 'Success!',
                text: 'Service created successfully.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            })

            navigate('/services')
        } catch (err) {
            console.error('Error creating service:', err)

            let msg = err instanceof Error ? err.message : 'Unknown error'
            try {
                const jsonError = JSON.parse(msg.replace('Failed to create service: ', ''))
                if (jsonError.errors) {
                    msg = Object.values(jsonError.errors).flat().join('\n')
                }
            } catch (e) { }

            setErrorMessage(msg)
            window.scrollTo(0, 0)
            await Swal.fire({
                title: 'Error!',
                text: 'Please check the form for errors.',
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
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Create Service</h1>
                <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Add a new company service</p>
            </div>

            <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '1000px' }}>
                <form onSubmit={handleSubmit}>

                    {errorMessage && (
                        <div style={{
                            backgroundColor: '#ef4444',
                            color: 'white',
                            padding: '12px',
                            borderRadius: '6px',
                            marginBottom: '24px',
                            whiteSpace: 'pre-line'
                        }}>
                            {errorMessage}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px', marginBottom: '24px' }}>
                        {/* General Fields */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ color: '#f9fafb', borderBottom: '1px solid #374151', paddingBottom: '8px', margin: 0 }}>General Settings</h3>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Order</label>
                                <input
                                    type="number"
                                    value={order}
                                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
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
                                />
                            </div>
                        </div>

                        {/* Media Uploads */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <h3 style={{ color: '#f9fafb', borderBottom: '1px solid #374151', paddingBottom: '8px', margin: 0 }}>Media</h3>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Service Icon</label>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    {iconPreview ? (
                                        <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #4b5563', backgroundColor: '#374151' }}>
                                            <img src={iconPreview} alt="Icon Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(setIcon, setIconPreview)}
                                                style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ width: '120px', height: '120px', borderRadius: '8px', border: '2px dashed #4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#374151' }}>
                                            <span style={{ color: '#9ca3af', fontSize: '12px' }}>No icon</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, setIcon, setIconPreview)}
                                        style={{ color: '#f9fafb' }}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Inner Image</label>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                    {innerImagePreview ? (
                                        <div style={{ position: 'relative', width: '200px', height: '120px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #4b5563', backgroundColor: '#374151' }}>
                                            <img src={innerImagePreview} alt="Inner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(setInnerImage, setInnerImagePreview)}
                                                style={{ position: 'absolute', top: '4px', right: '4px', backgroundColor: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ width: '200px', height: '120px', borderRadius: '8px', border: '2px dashed #4b5563', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#374151' }}>
                                            <span style={{ color: '#9ca3af', fontSize: '12px', padding: '10px', textAlign: 'center' }}>No inner image</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => handleImageChange(e, setInnerImage, setInnerImagePreview)}
                                        style={{ color: '#f9fafb' }}
                                    />
                                </div>
                            </div>

                        </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <h3 style={{ color: '#f9fafb', borderBottom: '1px solid #374151', paddingBottom: '8px', margin: '0 0 16px 0' }}>Translations</h3>
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

                    <div style={{ marginBottom: '32px' }}>
                        {languages.map((language, index) => (
                            <div key={language.id} style={{ display: activeTab === index ? 'block' : 'none' }}>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Title ({language.title})</label>
                                        <input
                                            type="text"
                                            value={titles[language.id] || ''}
                                            onChange={(e) => setTitles(prev => ({ ...prev, [language.id]: e.target.value }))}
                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '14px', backgroundColor: '#374151', color: '#f9fafb', boxSizing: 'border-box' }}
                                            placeholder="Service Title"
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Card Title ({language.title})</label>
                                        <input
                                            type="text"
                                            value={cardTitles[language.id] || ''}
                                            onChange={(e) => setCardTitles(prev => ({ ...prev, [language.id]: e.target.value }))}
                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '14px', backgroundColor: '#374151', color: '#f9fafb', boxSizing: 'border-box' }}
                                            placeholder="Title shown on cards"
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Description ({language.title})</label>
                                    <textarea
                                        value={descriptions[language.id] || ''}
                                        onChange={(e) => setDescriptions(prev => ({ ...prev, [language.id]: e.target.value }))}
                                        style={{ width: '100%', padding: '8px 12px', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '14px', backgroundColor: '#374151', color: '#f9fafb', boxSizing: 'border-box', minHeight: '120px', resize: 'vertical' }}
                                        placeholder="Main service description"
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Icon Alt Text ({language.title})</label>
                                        <input
                                            type="text"
                                            value={iconAltTexts[language.id] || ''}
                                            onChange={(e) => setIconAltTexts(prev => ({ ...prev, [language.id]: e.target.value }))}
                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '14px', backgroundColor: '#374151', color: '#f9fafb', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>Inner Image Alt Text ({language.title})</label>
                                        <input
                                            type="text"
                                            value={innerImageAltTexts[language.id] || ''}
                                            onChange={(e) => setInnerImageAltTexts(prev => ({ ...prev, [language.id]: e.target.value }))}
                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '14px', backgroundColor: '#374151', color: '#f9fafb', boxSizing: 'border-box' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ padding: '16px', backgroundColor: '#374151', borderRadius: '8px', border: '1px solid #4b5563' }}>
                                    <h4 style={{ margin: '0 0 16px 0', color: '#f9fafb', fontSize: '16px' }}>SEO Details ({language.title})</h4>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>SEO Title</label>
                                        <input
                                            type="text"
                                            value={seoTitles[language.id] || ''}
                                            onChange={(e) => setSeoTitles(prev => ({ ...prev, [language.id]: e.target.value }))}
                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '14px', backgroundColor: '#1f2937', color: '#f9fafb', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '16px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>SEO Keywords</label>
                                        <input
                                            type="text"
                                            value={seoKeywords[language.id] || ''}
                                            onChange={(e) => setSeoKeywords(prev => ({ ...prev, [language.id]: e.target.value }))}
                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '14px', backgroundColor: '#1f2937', color: '#f9fafb', boxSizing: 'border-box' }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>SEO Description</label>
                                        <textarea
                                            value={seoDescriptions[language.id] || ''}
                                            onChange={(e) => setSeoDescriptions(prev => ({ ...prev, [language.id]: e.target.value }))}
                                            style={{ width: '100%', padding: '8px 12px', border: '1px solid #4b5563', borderRadius: '6px', fontSize: '14px', backgroundColor: '#1f2937', color: '#f9fafb', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' }}
                                        />
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'flex', gap: '12px', borderTop: '1px solid #374151', paddingTop: '24px' }}>
                        <button
                            type="submit"
                            disabled={submitting}
                            style={{
                                backgroundColor: submitting ? '#93c5fd' : '#3b82f6',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '10px 20px',
                                cursor: submitting ? 'not-allowed' : 'pointer',
                                fontSize: '14px',
                                fontWeight: '500',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Plus size={18} />
                            {submitting ? 'Creating...' : 'Create Service'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/services')}
                            style={{
                                backgroundColor: '#374151',
                                color: '#f9fafb',
                                border: '1px solid #4b5563',
                                borderRadius: '6px',
                                padding: '10px 20px',
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
