// Ubicacion: DCO/apps/frontend/src/app/dashboard/assets/page.jsx

'use client';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import estilos from './AssetsPage.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth'; // 1. Importamos el hook de autenticación
import { obtenerActivos, subirActivo } from '@/lib/api';
import { LuCloudUpload } from 'react-icons/lu';


export default function AssetsPage() {
  const [activos, setActivos] = useState([]);
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth(); // 2. Obtenemos el token del contexto
  const inputFileRef = useRef(null); // Ref para el input de archivo

  const cargarActivos = async () => {
    setEstaCargando(true);
    try {
      const data = await obtenerActivos(token);
      setActivos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setEstaCargando(false);
    }
  };

  useEffect(() => {
    cargarActivos();
  }, [token]); // Añadir token como dependencia para que se recargue si el token cambia

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('asset', file); // 'asset' debe coincidir con el nombre en el backend

    setEstaCargando(true);
    try {
      await subirActivo(formData, token); 
      cargarActivos(); // Refrescamos la lista
    } catch (error) {
      alert('Error al subir la imagen.');
      console.error(error);
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <div>
      <header className={estilos.header}>
        <h1>Biblioteca de Activos</h1>
        {/* Este botón ahora abrirá el selector de archivos */}
        <button className={estilos.botonSubir} onClick={() => inputFileRef.current.click()}>
          <LuCloudUpload />
          <span>Subir Imagen</span>
        </button>
        <input 
          type="file" 
          ref={inputFileRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
        />
      </header>

      <div className={estilos.galeria}>
        {activos.map(activo => (
          <div key={activo.id} className={estilos.tarjetaActivo}>
            <img src={activo.cloudinary_url} alt={activo.file_name} />
            <p>{activo.file_name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}