'use client';
import { useState, useEffect } from 'react';
import { obtenerActivos } from '@/lib/api';
import { usarAuth } from '@/contexto/ContextoAuth';
import estilos from './SelectorDeActivos.module.scss';

export default function SelectorDeActivos({ onSeleccionar, moodboardImages = [] }) {
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
    <div className={estilos.selectorContainer}>
      {moodboardImages && moodboardImages.length > 0 && (
        <div className={estilos.moodboardSection}>
          <h3>Conceptos del Plan (IA)</h3>
          <div className={estilos.galeria}>
            {moodboardImages.map((imageUrl, index) => (
              <div 
                key={`mood-${index}`} 
                className={estilos.tarjetaActivo}
                onClick={() => onSeleccionar({ cloudinary_url: imageUrl, file_name: `Concepto IA ${index + 1}` })}
              >
                <img src={imageUrl} alt={`Concepto IA ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={estilos.librarySection}>
        <h3>Biblioteca de Activos</h3>
        <div className={estilos.galeria}>
          {activos.map(activo => (
            <div 
              key={activo.id} 
              className={estilos.tarjetaActivo}
              onClick={() => onSeleccionar(activo)}
            >
              <img src={activo.cloudinary_url} alt={activo.file_name} />
              <p>{activo.file_name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}