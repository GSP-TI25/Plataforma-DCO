//Ubicacion: DCO/apps/frontend/src/components/clients/FormularioCampañaMeta.jsx

'use client';
import { useState } from 'react';
import estilos from './FormularioCliente.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { crearCampañaEnMeta } from '@/lib/api';

export default function FormularioCampañaMeta({ onGuardado, clientId, adAccountId }) {
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('OUTCOME_TRAFFIC');
  const { setEstaCargando } = usarCarga();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstaCargando(true);
    try {
      await crearCampañaEnMeta(clientId, adAccountId, { name, objective });
      onGuardado();
    } catch (error) {
      console.error('Error al crear campaña en Meta:', error);
      alert(error.message || 'No se pudo crear la campaña.');
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={estilos.formulario}>
      <div className={estilos.grupoForm}>
        <label htmlFor="name">Nombre de la Campaña</label>
        <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className={estilos.grupoForm}>
        <label htmlFor="objective">Objetivo de la Campaña</label>
        <select id="objective" value={objective} onChange={(e) => setObjective(e.target.value)}>
          <option value="OUTCOME_TRAFFIC">Tráfico</option>
          <option value="OUTCOME_LEADS">Clientes Potenciales</option>
          <option value="OUTCOME_SALES">Ventas</option>
          <option value="OUTCOME_ENGAGEMENT">Interacción</option>
          <option value="LINK_CLICKS">Clics en el enlace</option>
        </select>
      </div>
      <div className={estilos.acciones}>
        <button type="submit" className={estilos.botonGuardar}>
          Crear Campaña en Meta
        </button>
      </div>
    </form>
  );
}
    