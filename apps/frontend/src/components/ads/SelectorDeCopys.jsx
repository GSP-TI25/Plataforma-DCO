// Ubicacion: DCO/apps/frontend/src/components/ads/SelectorDeCopys.jsx
'use client';
import estilos from './SelectorDeCopys.module.scss';
import { LuQuote } from "react-icons/lu";

export default function SelectorDeCopys({ copys, onSeleccionar }) {

  if (!copys || copys.length === 0) {
    return <p className={estilos.mensajeVacio}>No hay textos generados en el plan de contenido asociado.</p>;
  }

  return (
    <div className={estilos.listaContainer}>
      <ul className={estilos.listaCopys}>
        {copys.map((copy, index) => (
          <li key={index} onClick={() => onSeleccionar(copy)}>
            <LuQuote />
            <p>{copy}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}