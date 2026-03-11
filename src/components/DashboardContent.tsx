'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Users, Briefcase, DollarSign, Calendar, ArrowRight, FileText, MessageSquare, BarChart3, BookOpen, Mail, Eye, X } from 'lucide-react';
import StatCard from './StatCard';
import ProjectCard from './ProjectCard';
import ActivityChart from './ActivityChart';

export default function DashboardContent() {
  const [stats, setStats] = useState([
    { label: 'Total Revenue', value: '$0', icon: DollarSign },
    { label: 'Active Projects', value: '0', icon: Briefcase },
    { label: 'Client Score', value: '0/5', icon: TrendingUp },
  ]);

  const [recentProjects, setRecentProjects] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalTestimonials, setTotalTestimonials] = useState(0);
  const [totalServices, setTotalServices] = useState(0);
  const [totalFaqs, setTotalFaqs] = useState(0);
  const [recentBlogs, setRecentBlogs] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const apiUrl = import.meta.env?.VITE_API_URL || 'http://127.0.0.1:8000/api';
      const token = localStorage.getItem('auth_token');

      // Fetch statistics
      const statsResponse = await fetch(`${apiUrl}/admin/statistics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats([
          {
            label: 'Statistics',
            value: statsData.data?.length || '0',
            icon: BarChart3
          },
          {
            label: 'Pages',
            value: '0', // TODO: Fetch from /api/admin/pages
            icon: FileText
          },
          {
            label: 'Testimonials',
            value: '0', // TODO: Fetch from /api/admin/testimonials
            icon: MessageSquare
          },
          {
            label: 'Services',
            value: '0', // TODO: Fetch from /api/admin/services
            icon: Briefcase
          },
        ]);
        setTotalPages(statsData.data?.length || 0);
      }

      // Fetch recent projects (last 3)
      const projectsResponse = await fetch(`${apiUrl}/admin/portfolios?limit=3`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        const projects = projectsData.data?.slice(0, 3).map((project: any) => ({
          name: project.translations?.[0]?.title || 'Untitled Project',
          client: project.translations?.[0]?.description?.substring(0, 50) + '...' || 'Client',
          status: project.status === 1 ? 'Active' : 'Inactive',
          progress: 100,
          image: project.card_image // Use card_image from API
        }));
        setRecentProjects(projects);
      }

      // Fetch testimonials count
      const testimonialsResponse = await fetch(`${apiUrl}/admin/testimonials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (testimonialsResponse.ok) {
        const testimonialsData = await testimonialsResponse.json();
        setTotalTestimonials(testimonialsData.data?.length || 0);
      }

      // Fetch services count
      const servicesResponse = await fetch(`${apiUrl}/admin/services`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        setTotalServices(servicesData.data?.length || 0);
      }

      // Fetch FAQs count
      const faqsResponse = await fetch(`${apiUrl}/admin/faqs`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (faqsResponse.ok) {
        const faqsData = await faqsResponse.json();
        setTotalFaqs(faqsData.data?.length || 0);
      }

      // Fetch recent blogs
      const blogsResponse = await fetch(`${apiUrl}/admin/blogs?limit=3`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (blogsResponse.ok) {
        const blogsData = await blogsResponse.json();
        setRecentBlogs(blogsData.data?.slice(0, 3) || []);
      }

      // Fetch recent messages
      const messagesResponse = await fetch(`${apiUrl}/admin/contact-messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setRecentMessages(messagesData.data?.slice(0, 10) || []);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ flex: 1, overflowY: 'auto', backgroundColor: 'var(--background)' }}>
      <div style={{ padding: '32px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '36px', fontWeight: 'bold', marginBottom: '8px', margin: 0 }}>Welcome back</h1>
          <p style={{ color: 'var(--muted-foreground)', margin: 0 }}>Here's what's happening with your agency today</p>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Pages</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>{totalPages}</div>
          </div>
          <div style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Testimonials</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>{totalTestimonials}</div>
          </div>
          <div style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>Services</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>{totalServices}</div>
          </div>
          <div style={{
            backgroundColor: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px',
            textAlign: 'center'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', margin: '0 0 8px 0' }}>FAQs</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent)' }}>{totalFaqs}</div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '24px' }}>
          {/* Projects Section */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Recent Projects</h2>
                <button style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'var(--accent)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'opacity 200ms ease',
                  fontSize: '14px'
                }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  onClick={() => window.location.href = '/portfolios'}
                >
                  <span>View all</span>
                  <ArrowRight size={16} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentProjects.map((project, index) => (
                  <ProjectCard key={index} {...project} />
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Upcoming Deadlines */}
            {/* Recent Blogs */}
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BookOpen size={20} style={{ color: 'var(--accent)' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Recent Blogs</h3>
                </div>
                <button
                  onClick={() => window.location.href = '/blogs'}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  View all
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {recentBlogs.length > 0 ? (
                  recentBlogs.map((blog: any, index: number) => (
                    <div key={index} style={{ paddingBottom: '16px', borderBottom: index !== recentBlogs.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '500', margin: 0 }}>
                        {blog.created_at ? new Date(blog.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No date'}
                      </p>
                      <p style={{ fontSize: '14px', fontWeight: '500', marginTop: '4px', margin: 0, cursor: 'pointer' }} onClick={() => window.location.href = `/blogs/update/${blog.id}`}>
                        {blog.translations?.find((t: any) => t.language_id === 3)?.title ||
                          blog.translations?.[0]?.title ||
                          'Untitled Blog'}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', textAlign: 'center' }}>No recent blogs</p>
                )}
              </div>
            </div>

            {/* Recent Messages */}
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Mail size={20} style={{ color: 'var(--accent)' }} />
                  <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Recent Messages</h3>
                </div>
                <button
                  onClick={() => window.location.href = '/contact-messages'}
                  style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'var(--accent)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500'
                  }}
                >
                  View all
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                {recentMessages.length > 0 ? (
                  recentMessages.map((msg: any, index: number) => (
                    <div key={index} style={{
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: msg.read === 1 ? 'transparent' : 'rgba(74, 158, 255, 0.05)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{msg.name} {msg.surname}</p>
                        <button
                          onClick={() => { setSelectedMessage(msg); setModalOpen(true); }}
                          style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--accent)', cursor: 'pointer', padding: '4px' }}
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                      <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {msg.message}
                      </p>
                      <p style={{ fontSize: '10px', color: 'var(--muted-foreground)', margin: '4px 0 0 0' }}>
                        {new Date(msg.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', textAlign: 'center' }}>No recent messages</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Message Modal */}
      {modalOpen && selectedMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: 'var(--card)',
            borderRadius: '16px',
            border: '1px solid var(--border)',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--foreground)' }}>Message from {selectedMessage.name}</h2>
                <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>{selectedMessage.email} • {selectedMessage.phone}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  color: 'var(--foreground)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
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
              padding: '20px',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontSize: '15px',
              backgroundColor: 'var(--secondary)',
              color: 'var(--foreground)',
              minHeight: '150px',
              lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {selectedMessage.message}
            </div>
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <p style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>
                Received on {new Date(selectedMessage.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
