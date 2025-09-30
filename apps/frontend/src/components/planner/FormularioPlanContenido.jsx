// Ubicación: DCO/apps/frontend/src/components/planner/FormularioPlanContenido.jsx
'use client';
import { useState, useEffect } from 'react';
import estilos from './FormularioPlanContenido.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { crearPlanDeContenido, actualizarPlanDeContenido } from '@/lib/api';

export default function FormularioPlanContenido({ onGuardado, clientId, planAEditar }) {
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

  const isEditMode = !!planAEditar;

  useEffect(() => {
    if (isEditMode) {
      setName(planAEditar.name);
      setObjective(planAEditar.objective);
    } else {
      // Reset fields when form is used for creation
      setName('');
      setObjective('');
    }
  }, [planAEditar, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstaCargando(true);
    try {
      const planData = {
        name,
        client_id: clientId,
        objective,
      };

      if (isEditMode) {
        await actualizarPlanDeContenido(planAEditar.id, planData, token);
      } else {
        await crearPlanDeContenido(planData, token);
      }
      
      onGuardado(); // Notify parent page that we are done
    } catch (error) {
      console.error(`Error al ${isEditMode ? 'actualizar' : 'crear'} el plan:`, error);
      alert(error.message || `No se pudo ${isEditMode ? 'actualizar' : 'crear'} el plan de contenido.`);
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={estilos.formulario}>
      <div className={estilos.grupoForm}>
        <label htmlFor="name">Nombre del Plan</label>
        <input 
          id="name" 
          type="text" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          placeholder="Ej: Campaña de Verano 2025"
          required 
        />
      </div>
      <div className={estilos.grupoForm}>
        <label htmlFor="objective">Objetivo Principal</label>
        <textarea
          id="objective"
          rows="4"
          value={objective}
          onChange={(e) => setObjective(e.target.value)}
          placeholder="Describe en una o dos frases el objetivo de este plan de contenido..."
          required
        />
      </div>
      <div className={estilos.acciones}>
        <button type="submit" className={estilos.botonGuardar}>
          {isEditMode ? 'Guardar Cambios' : 'Crear Plan e Iniciar'}
        </button>
      </div>
    </form>
  );
}