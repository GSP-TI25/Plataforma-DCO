// Ubicación: DCO/apps/frontend/src/components/clients/FormularioCliente.jsx
'use client';
import { useState, useEffect } from 'react';
import estilos from './FormularioCliente.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { crearCliente, actualizarCliente } from '@/lib/api';

export default function FormularioCliente({ onGuardado, clienteAEditar }) {
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    contact_email: '',
    is_active: true,
  });
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();
  const esModoEdicion = Boolean(clienteAEditar);

  useEffect(() => {
    if (esModoEdicion) {
      setFormData({
        name: clienteAEditar.name,
        contact_person: clienteAEditar.contact_person,
        contact_email: clienteAEditar.contact_email,
        is_active: clienteAEditar.is_active,
      });
    } else {
      setFormData({ name: '', contact_person: '', contact_email: '', is_active: true });
    }
  }, [clienteAEditar]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstaCargando(true);
    try {
      if (esModoEdicion) {
        await actualizarCliente(clienteAEditar.id, formData, token);
      } else {
        await crearCliente(formData, token);
      }
      onGuardado();
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
      alert(error.message || 'No se pudo guardar el cliente.');
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={estilos.formulario}>
      <div className={estilos.grupoForm}>
        <label htmlFor="name">Nombre del Cliente</label>
        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} required />
      </div>
      <div className={estilos.grupoFormDosColumnas}>
        <div className={estilos.grupoForm}>
          <label htmlFor="contact_person">Persona de Contacto</label>
          <input id="contact_person" name="contact_person" type="text" value={formData.contact_person} onChange={handleChange} />
        </div>
        <div className={estilos.grupoForm}>
          <label htmlFor="contact_email">Email de Contacto</label>
          <input id="contact_email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} />
        </div>
      </div>
      <div className={estilos.grupoCheckbox}>
        <input id="is_active" name="is_active" type="checkbox" checked={formData.is_active} onChange={handleChange} />
        <label htmlFor="is_active">Cliente Activo</label>
      </div>
      <div className={estilos.acciones}>
        <button type="submit" className={estilos.botonGuardar}>
          {esModoEdicion ? 'Guardar Cambios' : 'Crear Cliente'}
        </button>
      </div>
    </form>
  );
}