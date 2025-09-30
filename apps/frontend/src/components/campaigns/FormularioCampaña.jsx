// Ubicación: DCO/apps/frontend/src/components/campaigns/FormularioCampaña.jsx
'use client';
import { useState, useEffect } from 'react';
import estilos from './FormularioCampaña.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { crearCampaña, actualizarCampaña } from '@/lib/api';

const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  // El input 'date' necesita el formato 'YYYY-MM-DD'
  return new Date(dateString).toISOString().split('T')[0];
};


export default function FormularioCampaña({ onCampañaGuardada, campañaAEditar }) {
  const [nombre, setNombre] = useState('');
  const [estado, setEstado] = useState('draft');
  const [startDate, setStartDate] = useState(''); // <-- 1. Nuevo estado para fecha de inicio
  const [endDate, setEndDate] = useState('');
  const { setEstaCargando } = usarCarga(); // <-- CORRECCIÓN 1: El nombre correcto aquí
  const { token } = usarAuth();

  useEffect(() => {
    if (campañaAEditar) {
      setNombre(campañaAEditar.name);
      setEstado(campañaAEditar.status);
      setStartDate(formatDateForInput(campañaAEditar.start_date));
      setEndDate(formatDateForInput(campañaAEditar.end_date));
    } else {
      setNombre('');
      setEstado('draft');
      setStartDate('');
      setEndDate('');
    }
  }, [campañaAEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstaCargando(true); // <-- CORRECCIÓN 2: Usamos el nombre correcto
    try {
      const datosCampaña = { 
        name: nombre, 
        status: estado,
        start_date: startDate || null,
        end_date: endDate || null
      };

      if (campañaAEditar) {
        await actualizarCampaña(campañaAEditar.id, datosCampaña, token);
      } else {
        await crearCampaña(datosCampaña, token);
      }

      onCampañaGuardada();
    } catch (error) {
      console.error('Error al guardar campaña:', error);
    } finally {
      setEstaCargando(false); 
    }
  };

  return (
    <form onSubmit={handleSubmit} className={estilos.formulario}>
      <div className={estilos.grupoForm}>
        <label htmlFor="nombre">Nombre de la Campaña</label>
        <input
          id="nombre"
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
      </div>
      <div className={estilos.grupoForm}>
        <label htmlFor="estado">Estado</label>
        <select
          id="estado"
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
        >
          <option value="draft">Borrador (Draft)</option>
          <option value="active">Activa</option>
          <option value="paused">Pausada</option>
          <option value="archived">Archivada</option>
        </select>
      </div>

      {/* --- 5. AÑADIMOS LOS NUEVOS INPUTS DE FECHA --- */}
      <div className={estilos.grupoFormDosColumnas}>
        <div className={estilos.grupoForm}>
          <label htmlFor="startDate">Fecha de Inicio</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className={estilos.grupoForm}>
          <label htmlFor="endDate">Fecha de Fin</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className={estilos.acciones}>
        <button type="submit" className={estilos.botonGuardar}>
          {campañaAEditar ? 'Guardar Cambios' : 'Crear Campaña'}
        </button>
      </div>
    </form>
  );
}