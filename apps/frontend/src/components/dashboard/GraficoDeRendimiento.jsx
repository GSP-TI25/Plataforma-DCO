'use client'; 
import styles from './GraficoDeRendimiento.module.scss';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

export default function GraficoDeRendimiento({ 
  data, 
  line1Key = "Clics", 
  line1Color = "#3b82f6", 
  line2Key = "Conversiones", 
  line2Color = "#10b981" 
}) {
  return (
    <div className={styles.contenedorGrafico}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart 
          data={data} 
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id={`colorArea1_${line1Key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={line1Color} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={line1Color} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id={`colorArea2_${line2Key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={line2Color} stopOpacity={0.4}/>
              <stop offset="95%" stopColor={line2Color} stopOpacity={0}/>
            </linearGradient>
            <filter id="line-shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.15" />
            </filter>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" />
          <Tooltip 
            contentStyle={{ 
              borderRadius: '8px', 
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)', 
              border: 'none',
              padding: '0.5rem 1rem'
            }}
            itemStyle={{ fontWeight: 500 }}
          />
          <Legend />

          <Area type="monotone" dataKey={line1Key} name={line1Key} stroke={line1Color} fill={`url(#colorArea1_${line1Key})`} strokeWidth={3} activeDot={{ r: 8, strokeWidth: 2, fill: '#fff' }} dot={false} filter="url(#line-shadow)" />
          <Area type="monotone" dataKey={line2Key} name={line2Key} stroke={line2Color} fill={`url(#colorArea2_${line2Key})`} strokeWidth={3} activeDot={{ r: 8, strokeWidth: 2, fill: '#fff' }} dot={false} filter="url(#line-shadow)" />

        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}