// Ubicación: DCO/apps/frontend/src/components/clients/FormularioCredencial.jsx
'use client';
import { useState } from 'react';
import estilos from './FormularioCredencial.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { crearCredencial } from '@/lib/api';

export default function FormularioCredencial({ onGuardado, clientId }) {
  const [platform, setPlatform] = useState('meta');
  const [accessToken, setAccessToken] = useState('');
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEstaCargando(true);
    try {
      const data = {
        client_id: clientId,
        platform: platform,
        access_token: accessToken,
      };
      await crearCredencial(data, token);
      onGuardado();
    } catch (error) {
      console.error('Error al guardar credencial:', error);
      alert(error.message || 'No se pudo guardar la credencial.');
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={estilos.formulario}>
      <div className={estilos.grupoForm}>
        <label htmlFor="platform">Plataforma</label>
        <select id="platform" value={platform} onChange={(e) => setPlatform(e.target.value)}>
          <option value="meta">Meta (Facebook/Instagram)</option>
          <option value="google">Google</option>
          <option value="tiktok">TikTok</option>
        </select>
      </div>
      <div className={estilos.grupoForm}>
        <label htmlFor="accessToken">Token de Acceso</label>
        <textarea
          id="accessToken"
          rows="5"
          value={accessToken}
          onChange={(e) => setAccessToken(e.target.value)}
          placeholder="Pega aquí el token de acceso de larga duración..."
          required
        />
      </div>
      <div className={estilos.acciones}>
        <button type="submit" className={estilos.botonGuardar}>
          Guardar Conexión
        </button>
      </div>
    </form>
  );
}