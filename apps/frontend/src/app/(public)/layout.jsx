// Ubicación: DCO/apps/frontend/src/app/(public)/layout.jsx
'use client';
import dynamic from 'next/dynamic';

const FondoAnimado = dynamic(() => import('@/components/layout/FondoAnimado'), {
  ssr: false,
});

const vantaOptions = {
  color: 0x3b82f6,         
  backgroundColor: 0x0a192f,
  points: 10.00,
  maxDistance: 25.00,
  spacing: 18.00
};

export default function PublicLayout({ children }) {
  return (
    <>
      {/* Capa 1: El fondo. Se renderiza y se va para atrás. */}
      <FondoAnimado effect="NET" options={vantaOptions} />
      {/* Capa 2: El contenido (tu página de login). Se renderiza por encima. */}
      {children}
    </>
  );
}