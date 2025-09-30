// Ubicación: DCO/apps/frontend/src/components/ui/Paginacion/Paginacion.jsx
'use client';
import estilos from './Paginacion.module.scss';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export default function Paginacion({ paginaActual, totalPaginas, enCambioDePagina }) {
  if (totalPaginas <= 1) {
    return null; // No mostrar nada si solo hay una página
  }

  return (
    <nav className={estilos.paginacionNav}>
      <button
        onClick={() => enCambioDePagina(paginaActual - 1)}
        disabled={paginaActual === 1}
        className={estilos.boton}
      >
        <LuChevronLeft />
        Anterior
      </button>
      <span className={estilos.infoPagina}>
        Página <strong>{paginaActual}</strong> de <strong>{totalPaginas}</strong>
      </span>
      <button
        onClick={() => enCambioDePagina(paginaActual + 1)}
        disabled={paginaActual === totalPaginas}
        className={estilos.boton}
      >
        Siguiente
        <LuChevronRight />
      </button>
    </nav>
  );
}