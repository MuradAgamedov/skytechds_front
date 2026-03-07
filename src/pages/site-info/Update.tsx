import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'

interface Language {
    id: number
    title: string
    lang_code: string
}

interface SiteInfo {
    id: number
    translations: Array<{
        header_logo_light_for_mode_alt_text: string
        header_logo_dark_for_mode_alt_text: string
        footer_logo_light_mode_alt_text: string
        footer_logo_dark_mode_alt_text: string
        language_id: number
        site_info_id: number
    }>
    header_logo_light_for_mode: string
    header_logo_dark_for_mode: string
    footer_logo_light_for_for_mode: string
    footer_logo_dark_for_mode: string
    favicon: string
}

export default function SiteInfoUpdate() {
    const navigate = useNavigate()
    const [languages, setLanguages] = useState<Language[]>([])
    const [activeTab, setActiveTab] = useState<number>(0)

    // Store alt texts keyed by language_id
    const [headerLightAltTexts, setHeaderLightAltTexts] = useState<Record<number, string>>({})
    const [headerDarkAltTexts, setHeaderDarkAltTexts] = useState<Record<number, string>>({})
    const [footerLightAltTexts, setFooterLightAltTexts] = useState<Record<number, string>>({})
    const [footerDarkAltTexts, setFooterDarkAltTexts] = useState<Record<number, string>>({})

    // Store image previews
    const [headerLightPreview, setHeaderLightPreview] = useState<string>('')
    const [headerDarkPreview, setHeaderDarkPreview] = useState<string>('')
    const [footerLightPreview, setFooterLightPreview] = useState<string>('')
    const [footerDarkPreview, setFooterDarkPreview] = useState<string>('')
    const [faviconPreview, setFaviconPreview] = useState<string>('')

    // Store image files
    const [headerLightFile, setHeaderLightFile] = useState<File | null>(null)
    const [headerDarkFile, setHeaderDarkFile] = useState<File | null>(null)
    const [footerLightFile, setFooterLightFile] = useState<File | null>(null)
    const [footerDarkFile, setFooterDarkFile] = useState<File | null>(null)
    const [faviconFile, setFaviconFile] = useState<File | null>(null)

    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    useEffect(() => {
        fetchLanguages().then(() => fetchSiteInfo())
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
        }
    }

    const fetchSiteInfo = async () => {
        try {
            const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
            const token = localStorage.getItem('auth_token')
            const res = await fetch(`${apiUrl}/admin/site-infos`, {
                headers: {
                    'Authorization': `Bearer ${token}` 
                }
            })
            if (!res.ok) throw new Error('Failed to fetch Site Info data')
            const json = await res.json()
            const siteInfoData = json.data

            // Set image previews
            if (siteInfoData.header_logo_light_for_mode) {
                setHeaderLightPreview(siteInfoData.header_logo_light_for_mode)
            }
            if (siteInfoData.header_logo_dark_for_mode) {
                setHeaderDarkPreview(siteInfoData.header_logo_dark_for_mode)
            }
            if (siteInfoData.footer_logo_light_for_mode) {
                setFooterLightPreview(siteInfoData.footer_logo_light_for_mode)
            }
            if (siteInfoData.footer_logo_dark_for_mode) {
                setFooterDarkPreview(siteInfoData.footer_logo_dark_for_mode)
            }
            if (siteInfoData.favicon) {
                setFaviconPreview(siteInfoData.favicon)
            }

            // Set alt texts from translations
            if (siteInfoData.translations) {
                siteInfoData.translations.forEach((t: any) => {
                    const langId = t.language_id
                    setHeaderLightAltTexts(prev => ({ ...prev, [langId]: t.header_logo_light_for_mode_alt_text || '' }))
                    setHeaderDarkAltTexts(prev => ({ ...prev, [langId]: t.header_logo_dark_for_mode_alt_text || '' }))
                    setFooterLightAltTexts(prev => ({ ...prev, [langId]: t.footer_logo_light_mode_alt_text || '' }))
                    setFooterDarkAltTexts(prev => ({ ...prev, [langId]: t.footer_logo_dark_mode_alt_text || '' }))
                })
            }
        } catch (err) {
            console.error('Error loading site info:', err)
            setErrorMessage('Failed to load site info details.')
        } finally {
            setLoading(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]
            const preview = URL.createObjectURL(file)
            
            switch(type) {
                case 'header_light':
                    setHeaderLightFile(file)
                    setHeaderLightPreview(preview)
                    break
                case 'header_dark':
                    setHeaderDarkFile(file)
                    setHeaderDarkPreview(preview)
                    break
                case 'footer_light':
                    setFooterLightFile(file)
                    setFooterLightPreview(preview)
                    break
                case 'footer_dark':
                    setFooterDarkFile(file)
                    setFooterDarkPreview(preview)
                    break
                case 'favicon':
                    setFaviconFile(file)
                    setFaviconPreview(preview)
                    break
            }
        }
    }

    const removeImage = (type: string) => {
        switch(type) {
            case 'header_light':
                setHeaderLightFile(null)
                setHeaderLightPreview('')
                break
            case 'header_dark':
                setHeaderDarkFile(null)
                setHeaderDarkPreview('')
                break
            case 'footer_light':
                setFooterLightFile(null)
                setFooterLightPreview('')
                break
            case 'footer_dark':
                setFooterDarkFile(null)
                setFooterDarkPreview('')
                break
            case 'favicon':
                setFaviconFile(null)
                setFaviconPreview('')
                break
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
            formData.append('_method', 'PUT')

            // Add image files if they exist
            if (headerLightFile) formData.append('header_logo_light_for_mode', headerLightFile)
            if (headerDarkFile) formData.append('header_logo_dark_for_mode', headerDarkFile)
            if (footerLightFile) formData.append('footer_logo_light_for_mode', footerLightFile)
            if (footerDarkFile) formData.append('footer_logo_dark_for_mode', footerDarkFile)
            if (faviconFile) formData.append('favicon', faviconFile)

            // Use bracket notation for translation compatibility (like Statistics/About pages)
            languages.forEach(lang => {
                // Only append if text exists and is not empty
                if (headerLightAltTexts[lang.id]) {
                    formData.append(`translations[header_logo_light_for_mode_alt_text][${lang.id}]`, headerLightAltTexts[lang.id] || '')
                }
                if (headerDarkAltTexts[lang.id]) {
                    formData.append(`translations[header_logo_dark_for_mode_alt_text][${lang.id}]`, headerDarkAltTexts[lang.id] || '')
                }
                if (footerLightAltTexts[lang.id]) {
                    formData.append(`translations[footer_logo_light_mode_alt_text][${lang.id}]`, footerLightAltTexts[lang.id] || '')
                }
                if (footerDarkAltTexts[lang.id]) {
                    formData.append(`translations[footer_logo_dark_mode_alt_text][${lang.id}]`, footerDarkAltTexts[lang.id] || '')
                }
            })

            const response = await fetch(`${apiUrl}/admin/site-infos/1`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` 
                },
                body: formData,
            })

            if (!response.ok) {
                const text = await response.text()
                throw new Error(`Failed to update site info: ${response.status} ${text}`)
            }

            await Swal.fire({
                title: 'Success!',
                text: 'Site information updated successfully.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            })

        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Unknown error'
            console.error('Error updating site info:', msg)
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

    const renderImageUpload = (title: string, preview: string, file: File | null, type: string) => (
        <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#f9fafb' }}>
                {title}
            </label>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                {preview && (
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
                            src={preview}
                            alt="Preview"
                            style={{ 
                                maxWidth: '100%', 
                                maxHeight: '100%', 
                                objectFit: 'cover',
                                width: '100%',
                                height: '100%'
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => removeImage(type)}
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
                        onChange={(e) => handleImageChange(e, type)}
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
    )

    if (loading) {
        return <div style={{ padding: '20px', color: '#f9fafb' }}>Loading...</div>
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Update Site Information</h1>
                <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage logos and alt texts for the website</p>
            </div>

            <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px', maxWidth: '800px' }}>
                <form onSubmit={handleSubmit}>

                    {/* Image Uploads */}
                    {renderImageUpload('Header Logo (Light Mode)', headerLightPreview, headerLightFile, 'header_light')}
                    {renderImageUpload('Header Logo (Dark Mode)', headerDarkPreview, headerDarkFile, 'header_dark')}
                    {renderImageUpload('Footer Logo (Light Mode)', footerLightPreview, footerLightFile, 'footer_light')}
                    {renderImageUpload('Footer Logo (Dark Mode)', footerDarkPreview, footerDarkFile, 'footer_dark')}
                    {renderImageUpload('Favicon', faviconPreview, faviconFile, 'favicon')}

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
                                        Header Logo Light Mode Alt Text ({language.title})
                                    </label>
                                    <input
                                        type="text"
                                        value={headerLightAltTexts[language.id] || ''}
                                        onChange={(e) => setHeaderLightAltTexts(prev => ({ ...prev, [language.id]: e.target.value }))}
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
                                        Header Logo Dark Mode Alt Text ({language.title})
                                    </label>
                                    <input
                                        type="text"
                                        value={headerDarkAltTexts[language.id] || ''}
                                        onChange={(e) => setHeaderDarkAltTexts(prev => ({ ...prev, [language.id]: e.target.value }))}
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
                                        Footer Logo Light Mode Alt Text ({language.title})
                                    </label>
                                    <input
                                        type="text"
                                        value={footerLightAltTexts[language.id] || ''}
                                        onChange={(e) => setFooterLightAltTexts(prev => ({ ...prev, [language.id]: e.target.value }))}
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
                                        Footer Logo Dark Mode Alt Text ({language.title})
                                    </label>
                                    <input
                                        type="text"
                                        value={footerDarkAltTexts[language.id] || ''}
                                        onChange={(e) => setFooterDarkAltTexts(prev => ({ ...prev, [language.id]: e.target.value }))}
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
