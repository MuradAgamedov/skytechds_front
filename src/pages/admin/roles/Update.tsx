import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Swal from 'sweetalert2'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface Role {
  id: number
  name: string
  permissions: string[]
  created_at: string
  updated_at: string
}

interface Permission {
  id: number
  name: string
}

interface PermissionGroup {
  name: string
  permissions: string[]
  icon: string
}

export default function RoleUpdate() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [role, setRole] = useState<Role | null>(null)
  const [name, setName] = useState('')
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  const permissionGroups: PermissionGroup[] = [
    {
      name: 'Admin Management',
      icon: '👥',
      permissions: [
        'admin.read',
        'admin.create',
        'admin.update',
        'admin.delete'
      ]
    },
    {
      name: 'User Management',
      icon: '👤',
      permissions: [
        'user.read',
        'user.create',
        'user.update',
        'user.delete'
      ]
    },
    {
      name: 'Blog Management',
      icon: '📝',
      permissions: [
        'blog.read',
        'blog.create',
        'blog.update',
        'blog.delete'
      ]
    },
    {
      name: 'Page Management',
      icon: '📄',
      permissions: [
        'page.read',
        'page.create',
        'page.update',
        'page.delete'
      ]
    },
    {
      name: 'Service Management',
      icon: '⚙️',
      permissions: [
        'service.read',
        'service.create',
        'service.update',
        'service.delete'
      ]
    },
    {
      name: 'About Management',
      icon: 'ℹ️',
      permissions: [
        'about.read',
        'about.create',
        'about.update',
        'about.delete'
      ]
    },
    {
      name: 'FAQ Management',
      icon: '❓',
      permissions: [
        'faq.read',
        'faq.create',
        'faq.update',
        'faq.delete'
      ]
    },
    {
      name: 'Portfolio Management',
      icon: '💼',
      permissions: [
        'portfolio.read',
        'portfolio.create',
        'portfolio.update',
        'portfolio.delete'
      ]
    },
    {
      name: 'Testimonial Management',
      icon: '⭐',
      permissions: [
        'testimonial.read',
        'testimonial.create',
        'testimonial.update',
        'testimonial.delete'
      ]
    },
    {
      name: 'Team Management',
      icon: '👥',
      permissions: [
        'team.read',
        'team.create',
        'team.update',
        'team.delete'
      ]
    },
    {
      name: 'Statistics Management',
      icon: '📊',
      permissions: [
        'statistic.read',
        'statistic.create',
        'statistic.update',
        'statistic.delete'
      ]
    },
    {
      name: 'Social Network Management',
      icon: '🌐',
      permissions: [
        'socialnetwork.read',
        'socialnetwork.create',
        'socialnetwork.update',
        'socialnetwork.delete'
      ]
    },
    {
      name: 'Site Information',
      icon: '🏢',
      permissions: [
        'siteinfo.read'
      ]
    },
    {
      name: 'Tag Management',
      icon: '🏷️',
      permissions: [
        'tag.read',
        'tag.create',
        'tag.update',
        'tag.delete'
      ]
    },
    {
      name: 'Permission Management',
      icon: '🔐',
      permissions: [
        'permission.read',
        'permission.create',
        'permission.update',
        'permission.delete'
      ]
    },
    {
      name: 'Role Management',
      icon: '🎭',
      permissions: [
        'role.read',
        'role.create',
        'role.update',
        'role.delete'
      ]
    },
    {
      name: 'Address Management',
      icon: '📍',
      permissions: [
        'address.read',
        'address.create',
        'address.update',
        'address.delete'
      ]
    },
    {
      name: 'Email Management',
      icon: '📧',
      permissions: [
        'email.read',
        'email.create',
        'email.update',
        'email.delete'
      ]
    },
    {
      name: 'Map Management',
      icon: '🗺️',
      permissions: [
        'map.read',
        'map.create',
        'map.update',
        'map.delete'
      ]
    },
    {
      name: 'Language Management',
      icon: '🌍',
      permissions: [
        'language.read',
        'language.create',
        'language.update',
        'language.delete'
      ]
    },
    {
      name: 'Dictionary Management',
      icon: '📚',
      permissions: [
        'dictionary.read',
        'dictionary.create',
        'dictionary.update',
        'dictionary.delete'
      ]
    },
    {
      name: 'Blog Category Management',
      icon: '📂',
      permissions: [
        'blogcategory.read',
        'blogcategory.create',
        'blogcategory.update',
        'blogcategory.delete'
      ]
    },
    {
      name: 'All SEO Management',
      icon: '🔍',
      permissions: [
        'allseo.read',
        'allseo.create',
        'allseo.update',
        'allseo.delete'
      ]
    },
    {
      name: 'Phone Management',
      icon: '📞',
      permissions: [
        'phone.read',
        'phone.create',
        'phone.update',
        'phone.delete'
      ]
    }
  ]

  useEffect(() => {
    fetchRole()
    fetchPermissions()
  }, [id])

  const fetchRole = async () => {
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/roles/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch role')
      }

      const data = await response.json()
      const roleData = data.data
      setRole(roleData)
      setName(roleData.name)
      setSelectedPermissions(roleData.permissions || [])
    } catch (error) {
      console.error('Error fetching role:', error)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to load role'
      })
      navigate('/admin/roles')
    }
  }

  const fetchPermissions = async () => {
    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')
      
      const response = await fetch(`${apiUrl}/admin/permissions`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch permissions')
      }

      const data = await response.json()
      setPermissions(data.data || [])
    } catch (error) {
      console.error('Error fetching permissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleGroup = (groupName: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupName)) {
        newSet.delete(groupName)
      } else {
        newSet.add(groupName)
      }
      return newSet
    })
  }

  const handlePermissionToggle = (permissionName: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionName)
        ? prev.filter(p => p !== permissionName)
        : [...prev, permissionName]
    )
  }

  const handleGroupToggle = (group: PermissionGroup) => {
    const allSelected = group.permissions.every(p => selectedPermissions.includes(p))
    if (allSelected) {
      setSelectedPermissions(prev => 
        prev.filter(p => !group.permissions.includes(p))
      )
    } else {
      setSelectedPermissions(prev => 
        [...new Set([...prev, ...group.permissions])]
      )
    }
  }

  const isGroupSelected = (group: PermissionGroup) => {
    return group.permissions.every(p => selectedPermissions.includes(p))
  }

  const isGroupPartiallySelected = (group: PermissionGroup) => {
    const selectedCount = group.permissions.filter(p => selectedPermissions.includes(p)).length
    return selectedCount > 0 && selectedCount < group.permissions.length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')
    setSubmitting(true)

    try {
      const apiUrl = (import.meta as any).env?.VITE_API_URL || 'http://127.0.0.1:8000/api'
      const token = localStorage.getItem('auth_token')

      const response = await fetch(`${apiUrl}/admin/roles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          name,
          permissions: selectedPermissions 
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update role')
      }

      await Swal.fire({
        title: 'Success!',
        text: 'Role updated successfully.',
        icon: 'success',
        confirmButtonColor: '#10b981'
      })

      navigate('/admin/roles')
    } catch (error) {
      console.error('Error updating role:', error)
      let message = 'Failed to update role'
      if (error instanceof Error) {
        message = error.message
      }
      setErrorMessage(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div style={{ padding: '20px', color: '#f9fafb' }}>Loading...</div>
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#f9fafb' }}>Update Role</h1>
        <p style={{ color: '#6b7280', margin: '4px 0 0 0' }}>Edit system role</p>
      </div>

      <div style={{ backgroundColor: '#1f2937', borderRadius: '8px', border: '1px solid #374151', padding: '24px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#f9fafb', fontSize: '14px', fontWeight: '500' }}>
              Role Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter role name"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: '#374151',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                color: '#f9fafb',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#4b5563'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '12px' 
            }}>
              <label style={{ color: '#f9fafb', fontSize: '14px', fontWeight: '500' }}>
                Permissions
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedPermissions(permissionGroups.flatMap(g => g.permissions))}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedPermissions([])}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              maxHeight: '500px',
              overflowY: 'auto',
              padding: '4px'
            }}>
              {permissionGroups.map((group) => {
                const isExpanded = expandedGroups.has(group.name)
                const groupSelected = isGroupSelected(group)
                const groupPartial = isGroupPartiallySelected(group)
                const selectedCount = group.permissions.filter(p => selectedPermissions.includes(p)).length
                
                return (
                  <div
                    key={group.name}
                    style={{
                      backgroundColor: '#1f2937',
                      border: `2px solid ${
                        groupSelected ? '#10b981' : groupPartial ? '#f59e0b' : '#374151'
                      }`,
                      borderRadius: '12px',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease',
                      boxShadow: groupSelected ? '0 4px 12px rgba(16, 185, 129, 0.15)' : 'none'
                    }}
                  >
                    <div
                      onClick={() => toggleGroup(group.name)}
                      style={{
                        padding: '16px',
                        cursor: 'pointer',
                        backgroundColor: isExpanded ? '#374151' : '#1f2937',
                        borderBottom: isExpanded ? '1px solid #4b5563' : 'none',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        if (!isExpanded) e.currentTarget.style.backgroundColor = '#374151'
                      }}
                      onMouseLeave={(e) => {
                        if (!isExpanded) e.currentTarget.style.backgroundColor = '#1f2937'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '20px', marginRight: '8px' }}>
                          {group.icon}
                        </span>
                        <h3 style={{ 
                          color: '#f9fafb', 
                          fontSize: '16px', 
                          fontWeight: '600',
                          margin: 0,
                          flex: 1
                        }}>
                          {group.name}
                        </h3>
                        <div style={{
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {isExpanded ? <ChevronDown size={16} color="#6b7280" /> : <ChevronRight size={16} color="#6b7280" />}
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <input
                            type="checkbox"
                            checked={groupSelected}
                            ref={(el) => {
                              if (el) el.indeterminate = groupPartial
                            }}
                            onChange={() => handleGroupToggle(group)}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                              width: '16px',
                              height: '16px',
                              marginRight: '8px',
                              accentColor: '#10b981'
                            }}
                          />
                          <span style={{ 
                            color: '#6b7280', 
                            fontSize: '12px',
                            fontWeight: '500'
                          }}>
                            {selectedCount}/{group.permissions.length} selected
                          </span>
                        </div>
                        
                        <div style={{
                          padding: '2px 8px',
                          backgroundColor: groupSelected ? '#10b981' : groupPartial ? '#f59e0b' : '#374151',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: '500'
                        }}>
                          {groupSelected ? 'All' : groupPartial ? 'Partial' : 'None'}
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && (
                      <div style={{ padding: '12px' }}>
                        <div style={{
                          display: 'grid',
                          gap: '6px',
                          maxHeight: '200px',
                          overflowY: 'auto'
                        }}>
                          {group.permissions.map((permission) => (
                            <label
                              key={permission}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '8px 12px',
                                backgroundColor: selectedPermissions.includes(permission) ? '#374151' : '#2d3748',
                                border: `1px solid ${selectedPermissions.includes(permission) ? '#10b981' : '#4b5563'}`,
                                borderRadius: '6px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                if (!selectedPermissions.includes(permission)) {
                                  e.currentTarget.style.backgroundColor = '#374151'
                                  e.currentTarget.style.borderColor = '#6b7280'
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!selectedPermissions.includes(permission)) {
                                  e.currentTarget.style.backgroundColor = '#2d3748'
                                  e.currentTarget.style.borderColor = '#4b5563'
                                }
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={selectedPermissions.includes(permission)}
                                onChange={() => handlePermissionToggle(permission)}
                                style={{
                                  width: '14px',
                                  height: '14px',
                                  marginRight: '8px',
                                  accentColor: '#10b981'
                                }}
                              />
                              <span style={{ 
                                fontFamily: 'monospace',
                                fontSize: '11px',
                                color: selectedPermissions.includes(permission) ? '#60a5fa' : '#d1d5db',
                                flex: 1,
                                wordBreak: 'break-all'
                              }}>
                                {permission}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            
            {selectedPermissions.length > 0 && (
              <div style={{ 
                marginTop: '12px',
                padding: '12px',
                backgroundColor: '#064e3b',
                border: '1px solid #10b981',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ color: '#10b981', fontSize: '14px' }}>✓</span>
                <span style={{ 
                  color: '#10b981', 
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {selectedPermissions.length} permission(s) selected
                </span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div style={{
              backgroundColor: '#ef4444',
              color: '#f9fafb',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {errorMessage}
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: submitting ? 'not-allowed' : 'pointer',
                backgroundColor: submitting ? '#6b7280' : '#3b82f6',
                color: '#f9fafb',
                transition: 'all 0.2s'
              }}
            >
              {submitting ? 'Updating...' : 'Update Role'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/admin/roles')}
              style={{
                padding: '10px 20px',
                border: '1px solid #4b5563',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                color: '#f9fafb',
                transition: 'all 0.2s'
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
