import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Hash, Plus, Edit, Trash2 } from 'lucide-react'

interface Tag {
    id: number
    status: number | boolean
    translations: Array<{
        id: number
        title: string
        language_id: number
    }>
    created_at: string
    updated_at: string
}

export default function TagsIndex() {
    const navigate = useNavigate()
    const [tags, setTags] = useState<Tag[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchTags()
    }, [])

    const fetchTags = async () => {
        try {
            const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
            const token = localStorage.getItem('auth_token')

            const response = await fetch(`${apiUrl}/admin/tags`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch tags')
            }
            const data = await response.json()
            setTags(data.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            console.error('Error fetching tags:', err)
        } finally {
            setLoading(false)
        }
    }

    const deleteTag = async (id: number) => {
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

            const response = await fetch(`${apiUrl}/admin/tags/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to delete tag')
            }

            await Swal.fire({
                title: 'Deleted!',
                text: 'Tag has been deleted.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            })

            fetchTags()
        } catch (err) {
            await Swal.fire({
                title: 'Error!',
                text: err instanceof Error ? err.message : 'Failed to delete tag',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            })
            console.error('Error deleting tag:', err)
        }
    }

    const getTranslationTextFromNested = (translations: Array<any>) => {
        if (!translations || translations.length === 0) return ''

        const az = translations.find(t => t.language_id === 3)
        const en = translations.find(t => t.language_id === 4)
        const ru = translations.find(t => t.language_id === 5)

        if (az && az.title) return az.title
        if (en && en.title) return en.title
        if (ru && ru.title) return ru.title

        // Try first available if language_id does not exist
        return translations[0].title || ''
    }

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Tags</h1>
                    <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage tags for your blogs</p>
                </div>
                <button
                    onClick={() => navigate('/tags/create')}
                    style={{
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}
                >
                    <Plus size={16} />
                    Add Tag
                </button>
            </div>

            {!loading && !error && tags.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
                    <Hash size={48} style={{ marginBottom: '16px', color: '#6b7280' }} />
                    <p style={{ marginBottom: '8px' }}>No tags found</p>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>No tags have been created yet!</p>
                </div>
            )}

            {!loading && !error && tags.length > 0 && (
                <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#374151' }}>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '50%' }}>Title/Keyword</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '20%' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '20%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tags.map((tag) => (
                                <tr key={tag.id} style={{ backgroundColor: '#1f2937' }}>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                                        <div style={{
                                            maxWidth: '300px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontWeight: '500'
                                        }}>
                                            {getTranslationTextFromNested(tag.translations) || `Tag ID: ${tag.id}`}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            backgroundColor: tag.status ? '#065f46' : '#991b1b',
                                            color: tag.status ? '#34d399' : '#f87171'
                                        }}>
                                            {tag.status ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => navigate(`/tags/update/${tag.id}`)}
                                                style={{
                                                    backgroundColor: '#10b981',
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
                                                onClick={() => deleteTag(tag.id)}
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
        </div>
    )
}
