// Ubicación: DCO/apps/frontend/src/components/creatives/FormularioCreatividad.jsx
'use client';
import { useState, useEffect } from 'react';
import estilos from './FormularioCreatividad.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { crearCreatividad, actualizarCreatividad } from '@/lib/api';

// El formulario ahora recibe la lista de campañas para el desplegable
export default function FormularioCreatividad({ onGuardado, campañas, creatividadAEditar }) {
  const [nombre, setNombre] = useState('');
  const [campaignId, setCampaignId] = useState(campañas[0]?.id || ''); // Selecciona la primera campaña por defecto
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

  useEffect(() => {
    if (creatividadAEditar) {
      setNombre(creatividadAEditar.name);
      setCampaignId(creatividadAEditar.campaign_id);
    } else {
      setNombre('');
      setCampaignId(campañas[0]?.id || '');
    }
  }, [creatividadAEditar, campañas]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstaCargando(true);
    try {
      const datos = { name: nombre, campaign_id: campaignId };
      if (creatividadAEditar) {
        await actualizarCreatividad(creatividadAEditar.id, datos, token);
      } else {
        await crearCreatividad(datos, token);
      }
      onGuardado();
    } catch (error) {
      console.error('Error al guardar creatividad:', error);
    } finally {
      setEstaCargando(false);
    }
  };


  return (
    <form onSubmit={handleSubmit} className={estilos.formulario}>
      <div className={estilos.grupoForm}>
        <label htmlFor="nombre">Nombre de la Creatividad</label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <div className={estilos.grupoForm}>
        <label htmlFor="campaña">Asociar a Campaña</label>
        <select
          id="campaña"
          value={campaignId}
          onChange={(e) => setCampaignId(e.target.value)}
          required
        >
          {campañas.map((campaña) => (
            <option key={campaña.id} value={campaña.id}>
              {campaña.name}
            </option>
          ))}
        </select>
      </div>
      <div className={estilos.acciones}>
        <button type="submit" className={estilos.botonGuardar}>
          {creatividadAEditar ? 'Guardar Cambios' : 'Crear Creatividad'}
        </button>
      </div>
    </form>
  );
}