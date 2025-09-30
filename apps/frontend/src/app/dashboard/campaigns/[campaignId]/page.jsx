// Ubicación: DCO/apps/frontend/src/app/dashboard/campaigns/[campaignId]/page.jsx

'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation'; // Hook para leer el [campaignId] de la URL
import { getCampaignById } from '@/lib/api'; // Necesitaremos una nueva función en la API
import { usarAuth } from '@/contexto/ContextoAuth';
import { usarCarga } from '@/contexto/ContextoCarga';
import estilos from './DetailPage.module.scss';
import { LuArrowLeft } from 'react-icons/lu';

export default function CampaignDetailPage() {
  const [campaña, setCampaña] = useState(null);
  const params = useParams(); 
  const router = useRouter();
  const { token } = usarAuth();
  const { setEstaCargando } = usarCarga();
  const campaignId = params.campaignId;

  useEffect(() => {
    const cargarDetalleCampaña = async () => {
      if (!token || !campaignId) return;
      setEstaCargando(true);
      try {
        const data = await getCampaignById(campaignId, token);
        setCampaña(data);
      } catch (error) {
        console.error("Error al cargar el detalle de la campaña:", error);
      } finally {
        setEstaCargando(false);
      }
    };

    cargarDetalleCampaña();
  }, [token, campaignId, setEstaCargando]);

  if (!campaña) {
    return null; 
  }

  return (
    <div className={estilos.detailContainer}>
      <div className={estilos.actionsHeader}>
        <button onClick={() => router.back()} className={estilos.botonRegresar}>
          <LuArrowLeft />
          <span>Volver</span>
        </button>
      </div>  
      <header className={estilos.header}>
        <h1>{campaña.name}</h1>
        <span className={`${estilos.badge} ${estilos[campaña.status]}`}>{campaña.status}</span>
      </header>
      <div className={estilos.content}>
        <div className={estilos.card}>
          <h2>Detalles de la Campaña</h2>
          <ul>
            <li><strong>ID:</strong> {campaña.id}</li>
            <li><strong>Estado:</strong> {campaña.status}</li>
            {/* --- 5. MOSTRAMOS TODOS LOS DATOS --- */}
            <li>
              <strong>Fecha de Inicio:</strong> 
              {campaña.start_date ? new Date(campaña.start_date).toLocaleString('es-PE') : 'No definida'}
            </li>
            <li>
              <strong>Fecha de Fin:</strong> 
              {campaña.end_date ? new Date(campaña.end_date).toLocaleString('es-PE') : 'No definida'}
            </li>
            <li><strong>Creada:</strong> {new Date(campaña.created_at).toLocaleString('es-PE')}</li>
            <li><strong>Última Actualización:</strong> {new Date(campaña.updated_at).toLocaleString('es-PE')}</li>
          </ul>
        </div>
        {/* Aquí en el futuro podríamos añadir una lista de las creatividades de esta campaña */}
      </div>
    </div>
  );
}
