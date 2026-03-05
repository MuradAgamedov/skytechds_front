import { Calendar } from 'lucide-react';

interface ProjectCardProps {
  name: string;
  client: string;
  status: string;
  progress: number;
  dueDate: string;
}

export default function ProjectCard({ name, client, status, progress, dueDate }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return { backgroundColor: 'rgba(34, 197, 94, 0.2)', color: '#22c55e' };
      case 'In Review':
        return { backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' };
      case 'In Progress':
        return { backgroundColor: 'rgba(74, 158, 255, 0.2)', color: 'var(--accent)' };
      default:
        return { backgroundColor: 'var(--secondary)', color: 'var(--foreground)' };
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return '#22c55e';
    if (progress >= 75) return 'var(--accent)';
    if (progress >= 50) return '#60a5fa';
    return '#fb923c';
  };

  return (
    <div style={{
      backgroundColor: 'var(--secondary)',
      borderRadius: 'var(--radius)',
      padding: '16px',
      transition: 'background-color 200ms ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontWeight: 'bold', marginBottom: '4px', margin: 0 }}>{name}</h4>
          <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', margin: 0 }}>{client}</p>
        </div>
        <span style={{
          fontSize: '12px',
          fontWeight: '500',
          paddingLeft: '12px',
          paddingRight: '12px',
          paddingTop: '4px',
          paddingBottom: '4px',
          borderRadius: '9999px',
          ...getStatusColor(status)
        }}>
          {status}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>Progress</span>
            <span style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>{progress}%</span>
          </div>
          <div style={{ height: '8px', backgroundColor: 'var(--muted)', borderRadius: '9999px', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                backgroundColor: getProgressColor(progress),
                width: `${progress}%`,
                transition: 'all 200ms ease'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--muted-foreground)', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
          <Calendar size={14} />
          <span>Due: {dueDate}</span>
        </div>
      </div>
    </div>
  );
}
