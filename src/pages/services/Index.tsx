import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { Layers, Plus, Edit, Trash2 } from 'lucide-react'

interface Service {
    id: number
    icon: string | null
    order: number
    status: number | 'active' | 'inactive'
    translations: Array<{
        id: number
        title: string
        language_id: number
    }>
    created_at: string
    updated_at: string
}

export default function ServicesIndex() {
    const navigate = useNavigate()
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        try {
            const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
            const token = localStorage.getItem('auth_token')

            const response = await fetch(`${apiUrl}/admin/services`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to fetch services')
            }
            const data = await response.json()
            setServices(data.data || [])
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            console.error('Error fetching services:', err)
        } finally {
            setLoading(false)
        }
    }

    const deleteService = async (id: number) => {
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

            const response = await fetch(`${apiUrl}/admin/services/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) {
                throw new Error('Failed to delete service')
            }

            await Swal.fire({
                title: 'Deleted!',
                text: 'Service has been deleted.',
                icon: 'success',
                confirmButtonColor: '#10b981'
            })

            fetchServices()
        } catch (err) {
            await Swal.fire({
                title: 'Error!',
                text: err instanceof Error ? err.message : 'Failed to delete service',
                icon: 'error',
                confirmButtonColor: '#ef4444'
            })
            console.error('Error deleting service:', err)
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

        return translations[0].title || ''
    }

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading...</div>
    }

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Services</h1>
                    <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Manage company services</p>
                </div>
                <button
                    onClick={() => navigate('/services/create')}
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
                    Add Service
                </button>
            </div>

            {!loading && !error && services.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
                    <Layers size={48} style={{ marginBottom: '16px', color: '#6b7280' }} />
                    <p style={{ marginBottom: '8px' }}>No services found</p>
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>No services have been created yet!</p>
                </div>
            )}

            {!loading && !error && services.length > 0 && (
                <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#374151' }}>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '15%' }}>Icon</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '25%' }}>Title</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '15%' }}>Status</th>
                                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '15%' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.id} style={{ backgroundColor: '#1f2937' }}>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151' }}>
                                        {service.icon ? (
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '4px',
                                                overflow: 'hidden',
                                                backgroundColor: '#374151',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <img
                                                    src={service.icon}
                                                    alt="Icon"
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                                                />
                                            </div>
                                        ) : (
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '4px',
                                                backgroundColor: '#374151',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#6b7280',
                                                fontSize: '10px'
                                            }}>
                                                N/A
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                                        <div style={{
                                            maxWidth: '250px',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontWeight: '500'
                                        }}>
                                            {getTranslationTextFromNested(service.translations) || 'Untitled'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151' }}>
                                        <span style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: '500',
                                            backgroundColor: service.status === 1 || service.status === 'active' ? '#10b981' : '#374151',
                                            color: '#f9fafb',
                                            border: service.status === 1 || service.status === 'active' ? '1px solid #10b981' : '1px solid #4b5563'
                                        }}>
                                            {service.status === 1 || service.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                 
                                    <td style={{ padding: '12px', borderBottom: '1px solid #374151' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => navigate(`/services/update/${service.id}`)}
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
                                                onClick={() => deleteService(service.id)}
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
