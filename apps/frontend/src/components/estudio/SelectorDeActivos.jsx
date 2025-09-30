'use client';
import { useState, useEffect } from 'react';
import { obtenerActivos } from '@/lib/api';
import { usarAuth } from '@/contexto/ContextoAuth';
import estilos from './SelectorDeActivos.module.scss';

export default function SelectorDeActivos({ onSeleccionar }) {
  const [activos, setActivos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const { token } = usarAuth();

  useEffect(() => {
    const cargarActivos = async () => {
      if (!token) {
        setCargando(false);
        return;
      }
      setCargando(true);
      try {
        const data = await obtenerActivos(token);
        setActivos(data);
      } catch (error) {
        console.error("Error al cargar activos:", error);
      } finally {
        setCargando(false);
      }
    };
    cargarActivos();
  }, [token]);

  if (cargando) {
    return <p>Cargando imágenes...</p>;
  }

  return (
    <div className={estilos.galeria}>
      {activos.map(activo => (
        <div 
          key={activo.id} 
          className={estilos.tarjetaActivo}
          // <<< CAMBIO: Ahora pasamos el objeto 'activo' completo
          onClick={() => onSeleccionar(activo)}
        >
          <img src={activo.cloudinary_url} alt={activo.file_name} />
          <p>{activo.file_name}</p>
        </div>
      ))}
    </div>
  );
}