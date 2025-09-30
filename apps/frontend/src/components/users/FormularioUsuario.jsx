// Ubicación: DCO/apps/frontend/src/components/users/FormularioUsuario.jsx

'use client';
import { useState, useEffect } from 'react';
import estilos from './FormularioUsuario.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { crearUsuario, actualizarUsuario } from '@/lib/api';

export default function FormularioUsuario({ onGuardado, usuarioAEditar }) {
  const [firstName, setFirstName] = useState(''); // Nuevo
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('diseñador');
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

  const esModoEdicion = Boolean(usuarioAEditar);

  useEffect(() => {
    if (esModoEdicion) {
      setFirstName(usuarioAEditar.first_name); // Cambiado
      setLastName(usuarioAEditar.last_name);
      setEmail(usuarioAEditar.email);
      setRole(usuarioAEditar.role);
      setPassword(''); // La contraseña no se edita, solo se puede establecer al crear
    } else {
      // Resetea el formulario para el modo creación
      setFirstName(''); // Cambiado
      setLastName('');
      setEmail('');
      setPassword('');
      setRole('diseñador');
    }
  }, [usuarioAEditar, esModoEdicion]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstaCargando(true);
    try {
      if (esModoEdicion) {
        await actualizarUsuario(usuarioAEditar.id, { firstName, lastName, role }, token); // Cambiado
      } else {
        await crearUsuario({ firstName, lastName, email, password, role }, token); // Cambiado
      }
      onGuardado();
    } catch (error) {
      console.error('Error al guardar el usuario:', error);
      alert(error.message || 'No se pudo guardar el usuario.');
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={estilos.formulario}>
      <div className={estilos.grupoFormDosColumnas}> {/* Contenedor para dos columnas */}
        <div className={estilos.grupoForm}>
          <label htmlFor="firstName">Nombres</label>
          <input id="firstName" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div className={estilos.grupoForm}>
          <label htmlFor="lastName">Apellidos</label>
          <input id="lastName" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
      </div>
      <div className={estilos.grupoForm}>
        <label htmlFor="email">Correo Electrónico</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={esModoEdicion} />
      </div>
      {!esModoEdicion && (
        <div className={estilos.grupoForm}>
          <label htmlFor="password">Contraseña</label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
      )}
      <div className={estilos.grupoForm}>
        <label htmlFor="role">Rol</label>
        <select id="role" value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="diseñador">Diseñador</option>
          <option value="redactor">Redactor</option>
          <option value="moderador">Moderador</option>
          <option value="analista">Analista</option>
          <option value="admin">Administrador</option>
        </select>
      </div>
      <div className={estilos.acciones}>
        <button type="submit" className={estilos.botonGuardar}>
          {esModoEdicion ? 'Guardar Cambios' : 'Crear Usuario'}
        </button>
      </div>
    </form>
  );
}