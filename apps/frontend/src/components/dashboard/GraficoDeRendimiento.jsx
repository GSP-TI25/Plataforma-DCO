// Ubicación: DCO/apps/frontend/src/components/dashboard/GraficoDeRendimiento.jsx
'use client'; // Los componentes de gráficos son interactivos y necesitan ser del cliente

import estilos from './GraficoDeRendimiento.module.scss';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export default function GraficoDeRendimiento({ data }) {
  return (
    <div className={estilos.contenedorGrafico}>
      {/* ResponsiveContainer hace que el gráfico se adapte al tamaño de su contenedor */}
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          {/* La parrilla de fondo del gráfico */}
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          {/* El eje X (horizontal) mostrará las fechas */}
          <XAxis dataKey="name" stroke="#6b7280" />
          {/* El eje Y (vertical) */}
          <YAxis stroke="#6b7280" />
          {/* El Tooltip es la ventanita que aparece al pasar el mouse sobre un punto */}
          <Tooltip />
          {/* La leyenda de abajo (Clics, Conversiones) */}
          <Legend />
          {/* La línea azul para los Clics */}
          <Line type="monotone" dataKey="Clics" stroke="#3b82f6" strokeWidth={2} activeDot={{ r: 8 }} />
          {/* La línea verde para las Conversiones */}
          <Line type="monotone" dataKey="Conversiones" stroke="#10b981" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}