// Ubicación: DCO/apps/frontend/src/app/dashboard/page.jsx
'use client';
import { useState, useEffect } from 'react';
import estilos from './Dashboard.module.scss';
import TarjetaDeMetrica from '@/components/dashboard/TarjetaDeMetrica';
import GraficoDeRendimiento from '@/components/dashboard/GraficoDeRendimiento';
import { LuMegaphone, LuPalette, LuMousePointerClick, LuRepeat } from 'react-icons/lu';

// --- ¡ASEGÚRATE DE QUE ESTA LÍNEA DE IMPORTACIÓN ESTÉ CORRECTA! ---
import { obtenerMetricasDashboard, obtenerDatosDeRendimiento } from '@/lib/api';

import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';

export default function DashboardPage() {
  const [metricas, setMetricas] = useState(null);
  const [datosGrafico, setDatosGrafico] = useState([]);
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

  useEffect(() => {
    const cargarDatos = async () => {
      if (!token) return;
      setEstaCargando(true);
      try {
        const [datosDeMetricas, datosDeRendimiento] = await Promise.all([
          obtenerMetricasDashboard(token),
          obtenerDatosDeRendimiento(token)
        ]);
        setMetricas(datosDeMetricas);
        setDatosGrafico(datosDeRendimiento);
      } catch (error) {
        console.error("Error al cargar los datos del dashboard:", error);
      } finally {
        setEstaCargando(false);
      }
    };

    if (token) cargarDatos();
  }, [token, setEstaCargando]);

  return (
    <div className={estilos.dashboardContainer}>
      <h1 className={estilos.tituloPrincipal}>Dashboard</h1>

      <div className={estilos.cuadriculaMetricas}>
        <TarjetaDeMetrica
          titulo="Campañas Activas"
          valor={metricas?.activeCampaigns ?? '...'}
          icono={<LuMegaphone />}
          color="#3b82f6"
        />
        <TarjetaDeMetrica
          titulo="Variaciones Creativas"
          valor={metricas?.creativeVariations ?? '...'}
          icono={<LuPalette />}
          color="#10b981"
        />
        <TarjetaDeMetrica
          titulo="Clics"
          valor={metricas?.clicks ?? '...'}
          icono={<LuMousePointerClick />}
          color="#8b5cf6"
        />
        <TarjetaDeMetrica
          titulo="Conversiones"
          valor={metricas?.conversions ?? '...'}
          icono={<LuRepeat />}
          color="#ef4444"
        />
      </div>

      <div className={estilos.contenedorGrafico}>
        <h2 className={estilos.subtitulo}>Rendimiento (Últimos 7 días)</h2>
        <GraficoDeRendimiento data={datosGrafico} />
      </div>
    </div>
  );
}