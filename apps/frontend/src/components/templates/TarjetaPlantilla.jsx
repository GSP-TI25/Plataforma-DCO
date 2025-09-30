// Ubicación: DCO/apps/frontend/src/components/templates/TarjetaPlantilla.jsx

'use client';
import estilos from './TarjetaPlantilla.module.scss';
import { LuPencil, LuTrash2 } from 'react-icons/lu';

export default function TarjetaPlantilla({ plantilla, onEditar, onBorrar }) {
  // NOTA: Por ahora no mostraremos una previsualización, solo el nombre.
  // Más adelante podríamos generar un 'thumbnail' de la plantilla.

  return (
    <div className={estilos.tarjeta}>
      <div className={estilos.preview}>
        <span>{plantilla.name.charAt(0)}</span>
      </div>
      <div className={estilos.info}>
        <p className={estilos.nombre}>{plantilla.name}</p>
        <span className={estilos.fecha}>
          Creada: {new Date(plantilla.created_at).toLocaleDateString('es-PE')}
        </span>
      </div>
      <div className={estilos.acciones}>
        <button onClick={() => onEditar(plantilla.id)} className={`${estilos.botonIcono} ${estilos.botonEditar}`}>
          <LuPencil />
        </button>
        <button onClick={() => onBorrar(plantilla.id)} className={`${estilos.botonIcono} ${estilos.botonBorrar}`}>
          <LuTrash2 />
        </button>
      </div>
    </div>
  );
}