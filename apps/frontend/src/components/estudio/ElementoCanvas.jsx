// Ubicación: DCO/apps/frontend/src/components/estudio/ElementoCanvas.jsx

'use client';
import { useRef } from 'react';
import estilos from './ElementoCanvas.module.scss';
import { Rnd } from 'react-rnd';

const limpiarUrlHtml = (url) => {
  if (typeof url !== 'string') return '';
  // Elimina cualquier etiqueta HTML que pueda envolver la URL
  return url.replace(/<[^>]*>?/gm, '');
};

export default function ElementoCanvas({ elemento, estaSeleccionado, onSeleccionar, onActualizar }) {
  const { id, tipo, contenido, x, y, width, height, fontSize, textAlign, color, rotation } = elemento;
  const elementoRef = useRef(null);

  const handleDragStop = (e, d) => {
    onActualizar(id, { x: d.x, y: d.y });
  };

  const handleResizeStop = (e, direction, ref, delta, position) => {
    onActualizar(id, {
      width: parseInt(ref.style.width, 10),
      height: parseInt(ref.style.height, 10),
      ...position,
    });
  };

  const handleElementoClick = (e) => {
    e.stopPropagation();
    onSeleccionar();
  };

  const handleRotate = (e) => {
    e.preventDefault();
    const elementoNode = elementoRef.current;
    if (!elementoNode) return;

    const rect = elementoNode.getBoundingClientRect();
    // Obtenemos el centro del elemento en la pantalla
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    // Calculamos el ángulo entre el centro del elemento y el cursor del mouse
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    
    onActualizar(id, { rotation: Math.round(angle) });
  };

  const handleMouseDown = (e) => {
    e.stopPropagation();
    window.addEventListener('mousemove', handleRotate);
    window.addEventListener('mouseup', () => {
      window.removeEventListener('mousemove', handleRotate);
    }, { once: true });
  };

  const clasesRnd = estaSeleccionado ? estilos.seleccionadoRnd : '';

  return (
    <Rnd
      ref={(c) => (elementoRef.current = c?.draggable?.current)}
      className={clasesRnd}
      style={{ transform: `rotate(${rotation || 0}deg)` }} // Añadimos '|| 0' por seguridad
      size={{ width, height }}
      position={{ x, y }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onClick={handleElementoClick}
      bounds="parent"
      minWidth={50}
      minHeight={30}
    >
      {/* El contenido interno (texto, imagen) no ha cambiado */}
      {tipo === 'texto' ? (
        <div
          className={estilos.contenidoInterno}
          style={{
            fontSize: `${fontSize}px`,
            textAlign: textAlign,
            color: color,
          }}
          dangerouslySetInnerHTML={{ __html: contenido }}
        />
      ) : (
        <img 
          src={limpiarUrlHtml(contenido)} 
          alt="elemento" 
          className={estilos.contenidoInterno}
          onDragStart={(e) => e.preventDefault()} 
        />
      )}
      
      {estaSeleccionado && (
        <div 
          className={estilos.rotationHandle}
          onMouseDown={handleMouseDown}
        ></div>
      )}
    </Rnd>
  );
}