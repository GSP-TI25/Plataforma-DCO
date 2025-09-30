//Ubicacion: DCO/apps/frontend/src/contexto/ContextoCarga.jsx
// Le decimos a Next.js que este componente es interactivo del lado del cliente
'use client'; 
import { createContext, useState, useContext } from 'react';
import estilos from './SpinnerCarga.module.scss';

const ContextoDeCarga = createContext();

const SpinnerDeCarga = () => (
  <div className={estilos.overlay}>
    <div className={estilos.spinner}></div>
    {/* We wrap each letter in a span so we can animate it */}
    <p className={estilos.texto}>
      <span>C</span>
      <span>a</span>
      <span>r</span>
      <span>g</span>
      <span>a</span>
      <span>n</span>
      <span>d</span>
      <span>o</span>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </p>
  </div>
);

// ... the rest of the file stays the same

export const ProveedorDeCarga = ({ children }) => {
  const [estaCargando, setEstaCargando] = useState(false);

  return (
    <ContextoDeCarga.Provider value={{ setEstaCargando }}>
      {estaCargando && <SpinnerDeCarga />}
      {children}
    </ContextoDeCarga.Provider>
  );
};

export const usarCarga = () => useContext(ContextoDeCarga);