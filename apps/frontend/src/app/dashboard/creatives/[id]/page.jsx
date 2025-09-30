// Ubicación: DCO/apps/frontend/src/app/dashboard/creatives/[id]/page.jsx

'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCreativeById } from '@/lib/api';
import { usarAuth } from '@/contexto/ContextoAuth';
import { usarCarga } from '@/contexto/ContextoCarga';
import estilos from '../../campaigns/[campaignId]/DetailPage.module.scss'; // Reutilizamos estilos
import { LuArrowLeft } from 'react-icons/lu';

export default function CreativeDetailPage() {
  const [creative, setCreative] = useState(null);
  const params = useParams();
  const router = useRouter();
  const { token } = usarAuth();
  const { setEstaCargando } = usarCarga();

  useEffect(() => {
    if (token && params.id) {
      setEstaCargando(true);
      getCreativeById(params.id, token)
        .then(data => setCreative(data))
        .catch(err => console.error("Error al cargar detalle de la creatividad:", err))
        .finally(() => setEstaCargando(false));
    }
  }, [token, params.id, setEstaCargando]);

  if (!creative) return null;

  return (
    <div className={estilos.detailContainer}>
      <div className={estilos.actionsHeader}>
        <button onClick={() => router.back()} className={estilos.botonRegresar}>
          <LuArrowLeft />
          <span>Volver</span>
        </button>
      </div>
      <header className={estilos.header}>
        <h1>{creative.name}</h1>
      </header>
      <div className={estilos.content}>
        <div className={estilos.card}>
          <h2>Detalles de la Creatividad</h2>
          <ul>
            <li><strong>ID:</strong> {creative.id}</li>
            <li><strong>Campaña Asociada:</strong> {creative.campaign_name}</li>
            <li><strong>Creada:</strong> {new Date(creative.created_at).toLocaleString('es-PE')}</li>
            <li><strong>Última Actualización:</strong> {new Date(creative.updated_at).toLocaleString('es-PE')}</li>
          </ul>
        </div>
        {/* Aquí en el futuro podríamos mostrar una previsualización de la creatividad */}
      </div>
    </div>
  );
}