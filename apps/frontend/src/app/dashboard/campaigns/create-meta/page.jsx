//Ubicacion: DCO/apps/frontend/src/app/dashboard/campaigns/create-meta/page.jsx

'use client';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usarAuth } from '@/contexto/ContextoAuth';
import { crearCampañaEnMeta, createAdSetInMeta , uploadImageToMeta, createAdCreativeInMeta, createAdInMeta } from '@/lib/api';

// Estilos (crearemos este archivo más adelante)
// import estilos from './CreateMetaCampaign.module.scss';

// IDs de ejemplo - Esto debería venir de la URL o de un selector en la UI
const CLIENT_ID_EJEMPLO = '1'; // Reemplazar con el ID del cliente real
const AD_ACCOUNT_ID_EJEMPLO = 'act_123456789'; // Reemplazar con el ID de la cuenta publicitaria real

export default function CreateMetaCampaignPage() {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState({});
  const [adSetData, setAdSetData] = useState({});
  const [adData, setAdData] = useState({});

  const handleNextStep = (data) => {
    if (step === 1) {
      setCampaignData(data);
    } else if (step === 2) {
      setAdSetData(data);
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmitAll = (finalAdData) => {
    console.log("Enviando todo a la API...");
    console.log("Campaña:", campaignData);
    console.log("Conjunto de Anuncios:", adSetData);
    console.log("Anuncio:", finalAdData);
    // Aquí iría la lógica de las mutaciones en cadena
  };

  return (
    <div>
      <h1>Crear Nueva Campaña en Meta</h1>
      <p>Paso {step} de 3</p>

      {step === 1 && <Step1Campaign onSubmit={handleNextStep} />}
      {step === 2 && <Step2AdSet onSubmit={handleNextStep} onBack={handlePrevStep} campaignData={campaignData} />}
      {step === 3 && <Step3AdCreative onSubmit={handleSubmitAll} onBack={handlePrevStep} />}
    </div>
  );
}


// --- Componentes de los Pasos ---

function Step1Campaign({ onSubmit, onBack, clientId, adAccountId }) {
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('LINK_CLICKS');
  const { token } = usarAuth();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => crearCampañaEnMeta(clientId, adAccountId, data, token),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['metaCampaigns', adAccountId] });
      onSubmit({ name, objective, meta_campaign_id: data.id });
    },
    onError: (error) => alert(`Error: ${error.message}`),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ name, objective });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Paso 1: Detalles de la Campaña</h2>
      <div>
        <label>Nombre de la Campaña</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={mutation.isPending} />
      </div>
      <div>
        <label>Objetivo</label>
        <select value={objective} onChange={(e) => setObjective(e.target.value)} disabled={mutation.isPending}>
          <option value="LINK_CLICKS">Clics en el enlace</option>
          <option value="CONVERSIONS">Conversiones</option>
          <option value="POST_ENGAGEMENT">Interacción con la publicación</option>
        </select>
      </div>
       <button type="button" onClick={onBack} disabled={mutation.isPending}>Atrás</button>
       <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creando...' : 'Siguiente'}</button>
    </form>
  );
}

function Step2AdSet({ onSubmit, onBack, campaignData, clientId, adAccountId }) {
    const [name, setName] = useState('');
    const [dailyBudget, setDailyBudget] = useState('1000');
    const { token } = usarAuth();
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data) => createAdSetInMeta(clientId, adAccountId, data, token),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['metaAdSets', campaignData.meta_campaign_id] });
            onSubmit({ name, daily_budget: dailyBudget, meta_ad_set_id: data.id });
        },
        onError: (error) => alert(`Error: ${error.message}`),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({ name, daily_budget: dailyBudget, campaign_id: campaignData.meta_campaign_id });
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Paso 2: Detalles del Conjunto de Anuncios</h2>
            <div>
                <label>Nombre del Conjunto de Anuncios</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={mutation.isPending} />
            </div>
            <div>
                <label>Presupuesto Diario (en centavos)</label>
                <input type="number" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} required disabled={mutation.isPending} />
            </div>
            <button type="button" onClick={onBack} disabled={mutation.isPending}>Atrás</button>
            <button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Creando...' : 'Siguiente'}</button>
        </form>
    );
}

function Step3AdCreative({ onBack, campaignData, adSetData, clientId, adAccountId }) {
    const [name, setName] = useState(() => 'Anuncio para ' + campaignData.name);
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const { token } = usarAuth();
    const queryClient = useQueryClient();

    const createAdMutation = useMutation({
        mutationFn: (data) => createAdInMeta(clientId, adAccountId, data, token),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['metaAds', adSetData.meta_ad_set_id] });
            alert('¡Campaña completa creada con éxito!');
        },
        onError: (error) => alert(`Error final: ${error.message}`),
    });

    const createCreativeMutation = useMutation({
        mutationFn: (data) => createAdCreativeInMeta(clientId, adAccountId, data, token),
        onSuccess: (data) => {
            createAdMutation.mutate({ 
                name: name,
                adset_id: adSetData.meta_ad_set_id,
                creative: { creative_id: data.id },
            });
        },
        onError: (error) => alert(`Error creando creatividad: ${error.message}`),
    });

    const uploadImageMutation = useMutation({
        mutationFn: (url) => uploadImageToMeta(clientId, adAccountId, url, token),
        onSuccess: (data) => {
            const FACEBOOK_PAGE_ID = 'ID_DE_TU_PAGINA_DE_FACEBOOK'; // IMPORTANTE: Reemplazar
            createCreativeMutation.mutate({ 
                name: `Creatividad para ${name}`,
                page_id: FACEBOOK_PAGE_ID,
                message: message,
                link: link,
                image_hash: data.hash
            });
        },
        onError: (error) => alert(`Error subiendo imagen: ${error.message}`),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        uploadImageMutation.mutate(imageUrl);
    };

    const isPending = uploadImageMutation.isPending || createCreativeMutation.isPending || createAdMutation.isPending;

    return (
        <form onSubmit={handleSubmit}>
            <h2>Paso 3: Creatividad y Anuncio</h2>
            <div>
                <label>Nombre del Anuncio</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required disabled={isPending} />
            </div>
            <div>
                <label>Texto del Anuncio (Copy)</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} required disabled={isPending} />
            </div>
            <div>
                <label>URL de la Imagen</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required placeholder="https://ejemplo.com/imagen.png" disabled={isPending} />
            </div>
            <div>
                <label>Enlace de Destino</label>
                <input type="text" value={link} onChange={(e) => setLink(e.target.value)} required placeholder="https://ejemplo.com/pagina-destino" disabled={isPending} />
            </div>
            <button type="button" onClick={onBack} disabled={isPending}>Atrás</button>
            <button type="submit" disabled={isPending}>{isPending ? 'Creando Campaña...' : 'Finalizar y Crear Campaña'}</button>
        </form>
    );
}

