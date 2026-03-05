'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const data = [
  { day: 'Mon', value: 40 },
  { day: 'Tue', value: 65 },
  { day: 'Wed', value: 50 },
  { day: 'Thu', value: 80 },
  { day: 'Fri', value: 95 },
  { day: 'Sat', value: 70 },
  { day: 'Sun', value: 60 },
];

export default function ActivityChart() {
  return (
    <div style={{
      backgroundColor: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '24px'
    }}>
      <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '24px', margin: 0 }}>Weekly Activity</h3>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" vertical={false} />
          <XAxis dataKey="day" stroke="#888888" style={{ fontSize: '12px' }} />
          <YAxis stroke="#888888" style={{ fontSize: '12px' }} />
          <Bar dataKey="value" fill="#4a9eff" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', margin: 0 }}>Total: 460 actions</p>
      </div>
    </div>
  );
}
