import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { MessageSquare, X, Trash2, Eye } from 'lucide-react'

interface ContactMessage {
  id: number
  name: string
  surname: string
  email: string
  phone: string
  message: string
  read: number
  created_at: string
}

export default function ContactMessagesIndex() {
  const navigate = useNavigate()
  const [contactMessages, setContactMessages] = useState<ContactMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    fetchContactMessages()
  }, [])

  const fetchContactMessages = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/admin/contact-messages`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch contact messages')
      }
      const data = await response.json()
      setContactMessages(data.data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const openMessageModal = (message: ContactMessage) => {
    setSelectedMessage(message)
    setModalOpen(true)
  }

  const closeModal = () => {
    setSelectedMessage(null)
    setModalOpen(false)
  }

  const toggleReadStatus = async (id: number) => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/admin/contact-messages/${id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to toggle read status')
      }

      const data = await response.json()

      await Swal.fire({
        title: 'Status Updated!',
        text: data.message || 'Contact message status has been updated.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      fetchContactMessages()
    } catch (err) {
      await Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to update status',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const deleteContactMessage = async (id: number) => {
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

      const response = await fetch(`${apiUrl}/admin/contact-messages/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Failed to delete contact message')
      }

      await Swal.fire({
        title: 'Deleted!',
        text: 'Contact message has been deleted.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      closeModal()
      fetchContactMessages()
    } catch (err) {
      await Swal.fire({
        title: 'Error!',
        text: err instanceof Error ? err.message : 'Failed to delete contact message',
        icon: 'error',
        confirmButtonColor: '#ef4444'
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Contact Messages</h1>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
          Loading contact messages...
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
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '20%' }}>Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '25%' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '15%' }}>Phone</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '15%' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '15%' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #4b5563', color: '#f9fafb', width: '10%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {contactMessages.map((message) => (
                <tr key={message.id} style={{ backgroundColor: '#1f2937' }}>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                    <div style={{ fontWeight: '500' }}>{message.name} {message.surname}</div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {message.email}
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                    <div style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {message.phone}
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      backgroundColor: message.read === 1 ? '#10b981' : '#ef4444',
                      color: 'white'
                    }}>
                      {message.read === 1 ? 'Read' : 'Unread'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151', color: '#f9fafb' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {formatDate(message.created_at)}
                    </div>
                  </td>
                  <td style={{ padding: '12px', borderBottom: '1px solid #374151' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}>
                      <button
                        onClick={() => openMessageModal(message)}
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
                        title="View Message"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => toggleReadStatus(message.id)}
                        style={{
                          backgroundColor: '#3b82f6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Toggle Read Status"
                      >
                        <MessageSquare size={16} />
                      </button>
                      <button
                        onClick={() => deleteContactMessage(message.id)}
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

      {!loading && !error && contactMessages.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#f9fafb' }}>
          <MessageSquare size={48} style={{ marginBottom: '16px', color: '#6b7280' }} />
          <p style={{ marginBottom: '8px' }}>No contact messages found</p>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>No messages have been submitted yet!</p>
        </div>
      )}

      {/* Message Modal — shows only the message text */}
      {modalOpen && selectedMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: '#1f2937',
            borderRadius: '12px',
            border: '1px solid #374151',
            padding: '24px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Message</h2>
              <button
                onClick={closeModal}
                style={{
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={20} />
              </button>
            </div>
            <div style={{
              padding: '12px',
              border: '1px solid #4b5563',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: '#374151',
              color: '#f9fafb',
              minHeight: '120px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {selectedMessage.message}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
