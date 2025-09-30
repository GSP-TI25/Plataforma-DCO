// Ubicacion: DCO/apps/frontend/src/components/clients/FormularioConjuntoAnuncios.jsx
'use client';
import { useState } from 'react';
import estilos from './FormularioCliente.module.scss'; // Reutilizamos estilos
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { crearConjuntoDeAnuncios } from '@/lib/api';

export default function FormularioConjuntoAnuncios({ onGuardado, clientId, adAccountId, campaignId }) {
  const [name, setName] = useState('');
  const [dailyBudget, setDailyBudget] = useState(5.00); // Presupuesto diario en dólares
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstaCargando(true);
    try {
      const adSetData = {
        name: name,
        campaign_id: campaignId,
        daily_budget: Math.round(dailyBudget * 100), // Convertir a centavos
      };
      await crearConjuntoDeAnuncios(clientId, adAccountId, adSetData, token);
      onGuardado();
    } catch (error) {
      console.error('Error al crear conjunto de anuncios:', error);
      alert(error.message || 'No se pudo crear el conjunto de anuncios.');
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={estilos.formulario}>
      <div className={estilos.grupoForm}>
        <label htmlFor="name">Nombre del Conjunto de Anuncios</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className={estilos.grupoForm}>
        <label htmlFor="dailyBudget">Presupuesto Diario (USD)</label>
        <input 
          id="dailyBudget" 
          type="number" 
          value={dailyBudget} 
          onChange={(e) => setDailyBudget(e.target.value)} 
          required 
          step="0.01"
          placeholder="Ej: 10.50"
        />
        <small>Ingrese el monto en dólares. Ej: 5.50 para $5.50</small>
      </div>
      <div className={estilos.acciones}>
        <button type="submit" className={estilos.botonGuardar}>
          Crear Conjunto de Anuncios
        </button>
      </div>
    </form>
  );
}