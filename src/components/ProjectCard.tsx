import { Calendar, Image } from 'lucide-react';

interface ProjectCardProps {
  name: string;
  client: string;
  status: string;
  progress: number;
  dueDate?: string;
  image?: string | null;
}

export default function ProjectCard({ name, client, status, progress, dueDate, image }: ProjectCardProps) {
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

  return (
    <div style={{
      backgroundColor: 'var(--secondary)',
      borderRadius: 'var(--radius)',
      padding: '20px',
      transition: 'background-color 200ms ease',
      cursor: 'pointer'
    }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--secondary)'}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '4px', margin: 0 }}>{name}</h4>
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

      <div style={{
        width: '100%',
        aspectRatio: '16/9',
        borderRadius: '12px',
        overflow: 'hidden',
        backgroundColor: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: '12px'
      }}>
        {image ? (
          <img
            src={image}
            alt={name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        ) : (
          <Image size={48} style={{ color: 'var(--muted-foreground)' }} />
        )}
      </div>
    </div>
  );
}
