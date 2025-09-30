//Ubicacion: DCO/apps/frontend/src/app/dashboard/planner/[planId]/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LuArrowLeft, LuSparkles, LuClipboardCopy, LuCopyCheck, LuSend, LuShieldCheck, LuShieldX, LuPencil, LuDownload, LuTrash2, LuRocket } from 'react-icons/lu';
import estilos from './PlanDetailPage.module.scss';
import { usarAuth } from '@/contexto/ContextoAuth';
import { 
  obtenerPlanDeContenidoPorId, 
  generarCopysParaPlan, 
  generarImagenParaPlan, 
  actualizarEstadoDelPlan, 
  actualizarPlanDeContenido,
  iniciarProduccionMeta,
  obtenerCuentasPublicitarias
} from '@/lib/api';
import Modal from '@/components/ui/Modal/Modal';

const formatStatus = (status) => {
  const statusMap = {
    draft: 'Borrador',
    pending_approval: 'Pendiente de Aprobación',
    approved: 'Aprobado',
    rejected: 'Rechazado',
  };
  return statusMap[status] || status;
};

export default function PlanDetailPage() {
  const [selectedAdAccount, setSelectedAdAccount] = useState('');
  const [textPrompt, setTextPrompt] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [copiedText, setCopiedText] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [imageInModal, setImageInModal] = useState(null);
  
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token } = usarAuth(); // OBTENEMOS EL TOKEN
  const planId = params.planId;

  // --- QUERIES ---
  const { data: plan, isLoading: isPlanLoading, isError: isPlanError } = useQuery({
    queryKey: ['plan', planId],
    // PASAMOS EL TOKEN A LA FUNCIÓN DE LA API
    queryFn: () => obtenerPlanDeContenidoPorId(planId, token),
    enabled: !!token && !!planId, // La query depende de que exista el token
  });

  const { data: adAccounts, isLoading: areAdAccountsLoading } = useQuery({
    queryKey: ['adAccounts', plan?.client_id],
    queryFn: () => obtenerCuentasPublicitarias(plan.client_id, token),
    enabled: !!plan?.client_id && !!token,
  });

  useEffect(() => {
    if (adAccounts && adAccounts.length > 0) {
      setSelectedAdAccount(adAccounts[0].id);
    }
  }, [adAccounts]);

  // --- MUTATIONS ---
  const { mutate: iniciarProduccion, isPending: isProduccionPending } = useMutation({
    mutationFn: (adAccountId) => iniciarProduccionMeta(planId, adAccountId, token),
    onSuccess: () => {
      alert('¡Campaña creada exitosamente en Meta!');
      queryClient.invalidateQueries({ queryKey: ['plan', planId] });
    },
    onError: (error) => {
      console.error("Error al iniciar producción:", error);
      alert(error.message || "No se pudo crear la campaña en Meta.");
    },
  });

  const { mutate: cambiarEstado, isPending: isStatusChanging } = useMutation({
    mutationFn: (newStatus) => actualizarEstadoDelPlan(planId, newStatus, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan', planId] }),
    onError: (error) => {
      console.error("Error al cambiar el estado:", error);
      alert("No se pudo actualizar el estado.");
    }
  });

  const { mutate: generateCopies, isPending: isGeneratingCopies } = useMutation({
    mutationFn: (prompt) => generarCopysParaPlan(planId, { prompt }, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan', planId] }),
    onError: (error) => {
      console.error("Error al generar copys:", error);
      alert("Hubo un error al comunicarse con la IA. Inténtalo de nuevo.");
    }
  });

  const { mutate: generateImage, isPending: isGeneratingImage } = useMutation({
    mutationFn: (prompt) => generarImagenParaPlan(planId, { prompt }, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan', planId] }),
    onError: (error) => {
      console.error("Error al generar la imagen:", error);
      alert("Hubo un error al generar la imagen. Inténtalo de nuevo.");
    }
  });

  const { mutate: updatePlan } = useMutation({
    mutationFn: (updatedData) => actualizarPlanDeContenido(planId, updatedData, token),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plan', planId] }),
    onError: (error) => {
      console.error("Error al actualizar el plan:", error);
      alert("No se pudo guardar el cambio.");
    }
  });

  // --- HANDLERS ---
  const handleIniciarProduccion = () => {
    if (!selectedAdAccount) return alert("Por favor, selecciona una cuenta publicitaria.");
    iniciarProduccion(selectedAdAccount);
  };

  const handleGenerateCopies = () => {
    if (!textPrompt) return alert("Por favor, escribe una instrucción para la IA.");
    generateCopies(textPrompt);
  };

  const handleGenerateImage = () => {
    if (!imagePrompt) return alert("Por favor, escribe una descripción para la imagen.");
    generateImage(imagePrompt);
  };

  const handleDeleteCopy = (indexToDelete) => {
    const newCopies = plan.generated_copies.filter((_, index) => index !== indexToDelete);
    updatePlan({ generated_copies: newCopies });
  };

  const handleDeleteImage = (indexToDelete) => {
    const newMoodboard = plan.generated_moodboard.filter((_, index) => index !== indexToDelete);
    updatePlan({ generated_moodboard: newMoodboard });
  };

  const handleCopy = (textToCopy, textId) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedText(textId);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}/approve/${plan.approval_token}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // --- EFECTO PARA MANEJAR REDIRECCIÓN POR ERROR ---
  useEffect(() => {
    if (isPlanError) {
      alert("Error: El plan no pudo ser cargado. Es posible que no exista o haya sido eliminado.");
      router.push('/dashboard/planner');
    }
  }, [isPlanError, router]);

  // --- RENDERIZADO CONDICIONAL ---
  if (isPlanLoading) {
    return <div className={estilos.container}><p>Cargando plan...</p></div>;
  }

  if (isPlanError || !plan) {
    return <div className={estilos.container}><p>Plan no encontrado o error al cargar. Redirigiendo...</p></div>;
  }

  return (
    <div className={estilos.container}>
      <div className={estilos.actionsHeader}>
        <button onClick={() => router.push('/dashboard/planner')} className={estilos.botonRegresar}>
          <LuArrowLeft />
          <span>Volver al Planificador</span>
        </button>
      </div>

      <header className={estilos.header}>
        <h1>{plan.name}</h1>
        <p>{plan.objective}</p>
      </header>

      <div className={estilos.grid}>
        <div className={estilos.card}>
          <div className={estilos.cardHeader}><LuSparkles /><h2>Asistente de Copys (IA)</h2></div>
          <div className={estilos.cardContent}>
            <textarea 
              placeholder="Ej: 'Genera 5 titulares para zapatillas de running'..." 
              rows="4"
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              disabled={isGeneratingCopies}
            ></textarea>
            <button className={estilos.botonGenerar} onClick={handleGenerateCopies} disabled={isGeneratingCopies}>
              {isGeneratingCopies ? 'Generando...' : 'Generar Textos'}
            </button>
            <div className={estilos.results}>
              {plan.generated_copies && plan.generated_copies.length > 0 ? (
                <ul className={estilos.copyList}>
                  {plan.generated_copies.map((copy, index) => (
                    <li key={index}>
                      <p>{copy}</p>
                      <div className={estilos.itemActions}>
                        <button onClick={() => handleCopy(copy, index)} title="Copiar texto">
                          {copiedText === index ? <LuCopyCheck className={estilos.copiedIcon} /> : <LuClipboardCopy />}
                        </button>
                        <button onClick={() => handleDeleteCopy(index)} title="Eliminar texto"><LuTrash2 /></button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={estilos.placeholder}>Los textos generados por la IA aparecerán aquí.</p>
              )}
            </div>
          </div>
        </div>

        <div className={estilos.card}>
          <div className={estilos.cardHeader}><LuSparkles /><h2>Generador de Moodboard (IA)</h2></div>
          <div className={estilos.cardContent}>
             <textarea 
              placeholder="Ej: 'Un astronauta montando a caballo en Marte, fotorrealista'..." 
              rows="4"
              value={imagePrompt}
              onChange={(e) => setImagePrompt(e.target.value)}
              disabled={isGeneratingImage}
             ></textarea>
            <button className={estilos.botonGenerar} onClick={handleGenerateImage} disabled={isGeneratingImage}>
              {isGeneratingImage ? 'Generando...' : 'Generar Imágenes'}
            </button>
            <div className={estilos.results}>
              {plan.generated_moodboard && plan.generated_moodboard.length > 0 ? (
                <div className={estilos.imageGrid}>
                  {plan.generated_moodboard.map((imageUrl, index) => (
                    <div key={index} className={estilos.imageContainer} onClick={() => setImageInModal(imageUrl)}>
                      <img src={imageUrl} alt={`Imagen generada ${index + 1}`} className={estilos.moodboardImage} />
                      <button 
                        className={estilos.deleteImageBtn} 
                        onClick={(e) => { e.stopPropagation(); handleDeleteImage(index); }}
                        title="Eliminar imagen"
                      ><LuTrash2 /></button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={estilos.placeholder}>Las imágenes conceptuales aparecerán aquí.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className={estilos.statusManager}>
        <h3>Estado y Acciones</h3>
        <div className={estilos.mainActions}>
          <div className={estilos.statusInfo}>
            <p>Estado actual:</p>
            <span className={`${estilos.statusBadge} ${estilos[plan.status]}`}>{formatStatus(plan.status)}</span>
          </div>
          {plan.status === 'approved' && adAccounts && adAccounts.length > 0 && !plan.meta_campaign_id && (
            <div className={estilos.adAccountSelector}>
              <label htmlFor="ad-account">Cuenta Publicitaria:</label>
              <select
                id="ad-account"
                value={selectedAdAccount}
                onChange={(e) => setSelectedAdAccount(e.target.value)}
                disabled={areAdAccountsLoading}
              >
                {areAdAccountsLoading ? <option>Cargando cuentas...</option> : adAccounts.map((account) => (
                  <option key={account.id} value={account.id}>{account.name} ({account.id})</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {plan.status === 'rejected' && plan.client_feedback && (
          <div className={estilos.feedbackDisplay}><h4>Feedback del Cliente:</h4><p>{plan.client_feedback}</p></div>
        )}
        
        <div className={estilos.statusActions}>
          {plan.status === 'draft' && (
            <button className={`${estilos.actionButton} ${estilos.primary}`} onClick={() => cambiarEstado('pending_approval')} disabled={isStatusChanging}>
              {isStatusChanging ? 'Enviando...' : <><LuSend /> Enviar a Aprobación</>}
            </button>
          )}
          {plan.status === 'pending_approval' && (
            <>
              <button className={estilos.actionButton} onClick={() => cambiarEstado('approved')} disabled={isStatusChanging}> <LuShieldCheck /> Aprobar (Manual) </button>
              <button className={estilos.actionButton} onClick={() => cambiarEstado('rejected')} disabled={isStatusChanging}> <LuShieldX /> Rechazar (Manual) </button>
            </>
          )}
          {plan.status === 'rejected' && (
            <button className={estilos.actionButton} onClick={() => cambiarEstado('draft')} disabled={isStatusChanging}>
              <LuPencil /> Realizar Cambios
            </button>
          )}
          {plan.status === 'approved' && (
            <button 
              className={`${estilos.actionButton} ${estilos.primary}`} 
              onClick={handleIniciarProduccion} 
              disabled={!!plan.meta_campaign_id || !adAccounts || adAccounts.length === 0 || isProduccionPending}
            >
              {isProduccionPending ? 'Creando...' : plan.meta_campaign_id ? `✔️ Creada (${plan.meta_campaign_id})` : <><LuRocket/> Iniciar Producción</>}
            </button>
          )}
        </div>

        {plan.status === 'pending_approval' && (
          <div className={estilos.approvalLinkContainer}>
            <p>Envía este enlace a tu cliente para que apruebe el plan:</p>
            <div className={estilos.linkBox}>
              <input type="text" value={`${window.location.origin}/approve/${plan.approval_token}`} readOnly />
              <button onClick={handleCopyLink} title="Copiar enlace">
                {copiedLink ? <LuCopyCheck className={estilos.copiedIcon} /> : <LuClipboardCopy />}
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal 
        titulo="Previsualización de Imagen" 
        estaAbierto={!!imageInModal} 
        alCerrar={() => setImageInModal(null)}
      >
        <div className={estilos.imageModalContent}>
          <img src={imageInModal} alt="Previsualización de imagen generada" />
          <a href={`http://localhost:8080/api/v1/download?url=${encodeURIComponent(imageInModal)}`} className={estilos.downloadButton}>
            <LuDownload /> Descargar Imagen
          </a>
        </div>
      </Modal>
    </div>
  );
}