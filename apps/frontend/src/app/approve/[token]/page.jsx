// Ubicacion: DCO/apps/frontend/src/app/approve/[token]/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { LuThumbsUp, LuThumbsDown, LuCircleCheck } from 'react-icons/lu';
import estilos from './ApprovalPage.module.scss';
import { obtenerPlanParaAprobacion, enviarDecisionDeAprobacion } from '@/lib/api';
import Modal from '@/components/ui/Modal/Modal';

export default function ApprovalPage() {
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [decision, setDecision] = useState(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const params = useParams();
  const token = params.token;

  useEffect(() => {
    if (!token) return;
    obtenerPlanParaAprobacion(token)
      .then(data => setPlan(data))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleDecision = async (status, feedback = '') => {
    setIsLoading(true);
    setFeedbackModalOpen(false); // Cerramos el modal si estaba abierto
    try {
      await enviarDecisionDeAprobacion(token, status, feedback);
      setDecision(status);
    } catch (err) {
      setError('Hubo un error al enviar tu decisión.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className={estilos.loader}>Cargando propuesta...</div>;
  }

  if (error) {
    return <div className={estilos.errorState}>{error}</div>;
  }
  
  if (decision) {
    return (
      <div className={estilos.thankYouState}>
        <LuCircleCheck />
        <h2>¡Gracias por tu respuesta!</h2>
        <p>Hemos notificado a la agencia de tu decisión.</p>
      </div>
    );
  }

  return (
    <div className={estilos.container}>
      <header className={estilos.header}>
        <div className={estilos.logo}>MOOD DCO</div>
        <h1>Propuesta de Contenido: {plan.name}</h1>
        <p>Cliente: {plan.client_name}</p>
      </header>
      
      <div className={estilos.card}>
        <h2>Textos Sugeridos</h2>
        <ul className={estilos.copyList}>
          {plan.generated_copies?.map((copy, index) => <li key={index}>{copy}</li>)}
        </ul>
      </div>

      <div className={estilos.card}>
        <h2>Conceptos Visuales (Moodboard)</h2>
        <div className={estilos.imageGrid}>
          {plan.generated_moodboard?.map((url, index) => <img key={index} src={url} alt={`Concepto ${index + 1}`} />)}
        </div>
      </div>

      <footer className={estilos.footer}>
        <h2>¿Qué te parece esta propuesta?</h2>
        <div className={estilos.actions}>
          <button className={estilos.approveButton} onClick={() => handleDecision('approved')}>
            <LuThumbsUp /> Aprobar Propuesta
          </button>
          <button className={estilos.rejectButton} onClick={() => setFeedbackModalOpen(true)}>
            <LuThumbsDown /> Solicitar Cambios
          </button>
        </div>
      </footer>

      <Modal 
        titulo="Solicitar Cambios"
        estaAbierto={feedbackModalOpen}
        alCerrar={() => setFeedbackModalOpen(false)}
      >
        <div className={estilos.feedbackForm}>
          <p>Por favor, describe los cambios que te gustaría solicitar.</p>
          <textarea 
            rows="6"
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="Ej: Me gustaría ver titulares más cortos. Las imágenes conceptuales están bien, pero prefiero un tono de color más cálido..."
          />
          <button 
            className={estilos.rejectButton}
            onClick={() => handleDecision('rejected', feedbackText)}
          >
            Enviar Solicitud
          </button>
        </div>
      </Modal>
    </div>
  );
}