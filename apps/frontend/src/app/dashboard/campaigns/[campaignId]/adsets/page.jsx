//Ubicacion: DCO/apps/frontend/src/app/dashboard/campaigns/[campaignId]/adsets/page.jsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { LuArrowLeft, LuTrash2, LuCirclePlus } from 'react-icons/lu';
import estilos from './AdsetsPage.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { obtenerConjuntosDeAnuncios, eliminarConjuntoDeAnuncios,obtenerPlanPorCampaignId  } from '@/lib/api';
import Modal from '@/components/ui/Modal/Modal';
import FormularioConjuntoAnuncios from '@/components/clients/FormularioConjuntoAnuncios';
import FormularioAnuncio from '@/components/ads/FormularioAnuncio';

export default function CampaignManagePage() {
  const [adSets, setAdSets] = useState([]);
  const [modalAdSetAbierto, setModalAdSetAbierto] = useState(false);
  const [modalAnuncioAbierto, setModalAnuncioAbierto] = useState(false);
  const [adSetSeleccionado, setAdSetSeleccionado] = useState(null);
  const [planData, setPlanData] = useState(null);

  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = usarAuth();
  const { setEstaCargando } = usarCarga();

  const campaignId = params.campaignId;
  const clientId = searchParams.get('clientId');
  const adAccountId = searchParams.get('adAccountId');
  const campaignName = searchParams.get('campaignName');

  const cargarAdSets = useCallback(async () => {
    if (!token || !clientId || !campaignId) return;
    setEstaCargando(true);
    try {
      const data = await obtenerConjuntosDeAnuncios(clientId, campaignId, token);
      setAdSets(data);
    } catch (error) {
      console.error("Error al cargar conjuntos de anuncios:", error);
    } finally {
      setEstaCargando(false);
    }
  }, [token, clientId, campaignId, setEstaCargando]);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      if (!token || !campaignId) return;
      
      cargarAdSets(); // Carga los Ad Sets

      // Carga el plan asociado
      try {
        const data = await obtenerPlanPorCampaignId(campaignId, token);
        setPlanData(data);
      } catch (error) {
        console.error("No se encontró un plan asociado a esta campaña:", error);
      }
    };
    
    cargarDatosIniciales();
  }, [cargarAdSets, token, campaignId]);


  const handleAdSetGuardado = () => {
    setModalAdSetAbierto(false);
    cargarAdSets();
  };

  const handleAnuncioGuardado = () => {
    setModalAnuncioAbierto(false);
  };

  const handleBorrarAdSet = async (adSetId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este conjunto de anuncios de Meta?')) {
      setEstaCargando(true);
      try {
        await eliminarConjuntoDeAnuncios(clientId, adSetId, token);
        cargarAdSets();
      } catch (error) {
        console.error("Error al eliminar conjunto de anuncios:", error);
        alert('No se pudo eliminar el conjunto de anuncios.');
      } finally {
        setEstaCargando(false);
      }
    }
  };

  const abrirModalAnuncio = (adSet) => {
    setAdSetSeleccionado(adSet);
    setModalAnuncioAbierto(true);
  };

  return (
    <div className={estilos.container}> 
      <div className={estilos.actionsHeader}>
        <button onClick={() => router.back()} className={estilos.botonRegresar}>
          <LuArrowLeft />
          <span>Volver</span>
        </button>
      </div>

      <header className={estilos.header}>
        <h1>{decodeURIComponent(campaignName || 'Campaña')}</h1>
        <p>Gestionar Conjuntos de Anuncios</p>
      </header>

      <div className={estilos.card}>
        <div className={estilos.cardHeader}>
          <h2>Conjuntos de Anuncios</h2>
          <button className={estilos.botonCrear} onClick={() => setModalAdSetAbierto(true)}>
            <LuCirclePlus />
            Crear Conjunto de Anuncios
          </button>
        </div>
        <div className={estilos.cardContent}>
          <table className={estilos.tabla}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Presupuesto Diario</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {adSets.length > 0 ? (
                adSets.map(adSet => (
                  <tr key={adSet.id}>
                    <td>{adSet.name}</td>
                    <td>{adSet.daily_budget ? `$${(adSet.daily_budget / 100).toFixed(2)}` : 'N/A'}</td>
                    <td><span className={`${estilos.statusBadge} ${estilos[adSet.status?.toLowerCase()]}`}>{adSet.status}</span></td>
                    <td>
                      <div className={estilos.botonesAccion}>
                        <button 
                          title="Crear Anuncio"
                          className={`${estilos.botonIcono} ${estilos.botonCrearAnuncio}`}
                          onClick={() => abrirModalAnuncio(adSet)}
                        >
                          <LuCirclePlus />
                        </button>
                        <button 
                          title="Eliminar" 
                          className={`${estilos.botonIcono} ${estilos.botonBorrar}`}
                          onClick={() => handleBorrarAdSet(adSet.id)}
                        >
                          <LuTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={estilos.mensajeVacio}>
                    No se encontraron conjuntos de anuncios para esta campaña.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal titulo={`Crear Anuncio en: ${adSetSeleccionado?.name}`} estaAbierto={modalAnuncioAbierto} alCerrar={() => setModalAnuncioAbierto(false)}>
        <FormularioAnuncio
          onGuardado={handleAnuncioGuardado}
          adSetId={adSetSeleccionado?.id}
          copysDelPlan={planData?.generated_copies || []}
          moodboardDelPlan={planData?.generated_moodboard || []}
          clientId={clientId}
          adAccountId={adAccountId}
        />
      </Modal>

      <Modal titulo="Crear Nuevo Conjunto de Anuncios" estaAbierto={modalAdSetAbierto} alCerrar={() => setModalAdSetAbierto(false)}>
        <FormularioConjuntoAnuncios
          onGuardado={handleAdSetGuardado}
          clientId={clientId}
          adAccountId={adAccountId}
          campaignId={campaignId}
        />
      </Modal>
    </div>
  );
}