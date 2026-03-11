import type { ComponentType, SVGProps } from 'react';

interface LucideProps extends Partial<SVGProps<SVGSVGElement>> {
  color?: string;
  size?: string | number;
  strokeWidth?: string | number;
  class?: string;
  absoluteStrokeWidth?: boolean;
}

interface StatCardProps {
  label: string;
  value: string;
  change?: string;
  icon: ComponentType<LucideProps>;
  trend?: 'up' | 'down';
}

export default function StatCard({ label, value, change, icon: Icon, trend }: StatCardProps) {
  return (
    <div style={{
      backgroundColor: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '24px',
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: change ? '16px' : '0' }}>
        <div>
          <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', marginBottom: '8px' }}>{label}</p>
          <h3 style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--foreground)' }}>{value}</h3>
        </div>
        <div style={{ padding: '12px', backgroundColor: 'var(--secondary)', borderRadius: 'var(--radius)' }}>
          <Icon size={24} style={{ color: 'var(--accent)' }} />
        </div>
      </div>
      {change && (
        <p style={{
          fontSize: '14px',
          fontWeight: '500',
          color: trend === 'up' ? '#00ff88' : '#ff4a4a',
          marginTop: '8px'
        }}>
          {change}
        </p>
      )}
    </div>
  );
}
