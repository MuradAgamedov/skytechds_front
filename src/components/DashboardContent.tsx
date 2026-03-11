'use client';

import { TrendingUp, Users, Briefcase, DollarSign, Calendar, ArrowRight } from 'lucide-react';
import StatCard from './StatCard';
import ProjectCard from './ProjectCard';
import ActivityChart from './ActivityChart';

export default function DashboardContent() {
  const stats = [
    { label: 'Total Revenue', value: '$124,580', change: '+12.5%', icon: DollarSign, trend: 'up' },
    { label: 'Active Projects', value: '18', change: '+4 this month', icon: Briefcase, trend: 'up' },
    { label: 'Client Score', value: '4.8/5', change: '+0.2 points', icon: TrendingUp, trend: 'up' },
  ];

  const recentProjects = [
    { name: 'E-commerce Platform', client: 'TechCorp Inc', status: 'In Progress', progress: 75, dueDate: 'Mar 15' },
    { name: 'Mobile App Design', client: 'StartUp Labs', status: 'In Review', progress: 90, dueDate: 'Mar 20' },
    { name: 'Brand Identity', client: 'Creative Studio', status: 'Completed', progress: 100, dueDate: 'Mar 1' },
  ];

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
            <div style={{
              backgroundColor: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <Calendar size={20} style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>Upcoming</h3>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {[
                  { date: 'Today', title: 'Client Review Call' },
                  { date: 'Tomorrow', title: 'Design Deadline' },
                  { date: 'Mar 10', title: 'Project Delivery' },
                ].map((item, index) => (
                  <div key={index} style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                    <p style={{ fontSize: '12px', color: 'var(--accent)', fontWeight: '500', margin: 0 }}>{item.date}</p>
                    <p style={{ fontSize: '14px', fontWeight: '500', marginTop: '4px', margin: 0 }}>{item.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Chart */}
            <ActivityChart />

            {/* Help Card */}
            <div style={{
              backgroundImage: 'linear-gradient(135deg, rgba(74, 158, 255, 0.2), rgba(74, 158, 255, 0.05))',
              border: '1px solid rgba(74, 158, 255, 0.3)',
              borderRadius: 'var(--radius)',
              padding: '24px'
            }}>
              <h3 style={{ fontWeight: 'bold', marginBottom: '8px', margin: 0 }}>Need Help?</h3>
              <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '16px', margin: '8px 0 16px 0' }}>
                Check out our documentation or contact support.
              </p>
              <button style={{
                width: '100%',
                backgroundColor: 'var(--accent)',
                color: 'var(--primary-foreground)',
                borderRadius: 'var(--radius)',
                padding: '8px 0',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 200ms ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
              >
                View Docs
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
