// Ubicación: DCO/apps/frontend/src/app/dashboard/creatives/data-sources/page.jsx
'use client';
import { useState, useEffect } from 'react';
import estilos from './DataSourcesPage.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { obtenerFuentesDeDatos } from '@/lib/api';
import { LuCloudUpload } from 'react-icons/lu';
import Modal from '@/components/ui/Modal/Modal';
import FormularioSubida from '@/components/data-sources/FormularioSubida';

export default function DataSourcesPage() {
  const [fuentes, setFuentes] = useState([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

  const cargarFuentes = async () => {
    if (!token) return;
    setEstaCargando(true);
    try {
      const data = await obtenerFuentesDeDatos(token);
      setFuentes(data);
    } catch (error) {
      console.error(error);
    } finally {
      setEstaCargando(false);
    }
  };

  useEffect(() => {
    if (token) cargarFuentes();
  }, [token]);

  const handleSubidaExitosa = () => {
    setModalAbierto(false);
    cargarFuentes();
  };

  return (
    <div>
      <header className={estilos.header}>
        <h1>Fuentes de Datos</h1>
        <button className={estilos.botonSubir} onClick={() => setModalAbierto(true)}>
          <LuCloudUpload />
          <span>Subir Archivo</span>
        </button>
      </header>


      <div className={estilos.contenedorTabla}>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th>Nombre del Archivo</th>
              <th>Fecha de Subida</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {fuentes.map((fuente) => (
              <tr key={fuente.id}>
                <td>{fuente.name}</td>
                <td>{new Date(fuente.created_at).toLocaleDateString('es-PE')}</td>
                <td>
                  <button className={estilos.botonAccion}>Ver Datos</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        titulo="Subir Nueva Fuente de Datos"
        estaAbierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
      >
        <FormularioSubida onSubidaExitosa={handleSubidaExitosa} />
      </Modal>
    </div>
  );
}