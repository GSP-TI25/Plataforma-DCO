'use client';
import { LuX } from 'react-icons/lu';
import estilos from './Modal.module.scss';

// <<< CAMBIO 1: Añadimos 'size' a las props, con 'medium' por defecto
export default function Modal({ estaAbierto, alCerrar, titulo, children, size = 'medium' }) {
  if (!estaAbierto) {
    return null;
  }

  const handleContenidoClick = (e) => e.stopPropagation();

  // <<< CAMBIO 2: Creamos una clase dinámica para el tamaño
  const modalClasses = `${estilos.modal} ${estilos[size] || ''}`;

  return (
    <div className={estilos.overlay} onClick={alCerrar}>
      {/* <<< CAMBIO 3: Usamos la nueva clase */}
      <div className={modalClasses} onClick={handleContenidoClick}>
        <header className={estilos.header}>
          <h2>{titulo}</h2>
          <button onClick={alCerrar} className={estilos.botonCerrar}>
            <LuX />
          </button>
        </header>
        <main className={estilos.contenido}>
          {children}
        </main>
      </div>
    </div>
  );
}