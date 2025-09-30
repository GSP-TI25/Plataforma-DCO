// Ubicación: DCO/apps/frontend/src/components/layout/FondoAnimado.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min.js';

const vantaEffects = {
  NET: NET,
};

// Este componente ahora NO acepta {children}
const FondoAnimado = ({ effect = 'NET', options = {} }) => {
  const [vantaEffect, setVantaEffect] = useState(0);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaEffect && vantaRef.current) {
      const VantaEffectComponent = vantaEffects[effect];
      if (VantaEffectComponent) {
        setVantaEffect(
          VantaEffectComponent({
            el: vantaRef.current,
            THREE: THREE,
            ...options,
          })
        );
      }
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect, effect, options]);

  // El div ahora es auto-cerrado. Su única misión es ser el lienzo de Vanta.
  return (
    <div 
      ref={vantaRef} 
      style={{ 
        width: '100vw', 
        height: '100vh', 
        position: 'fixed', // Fijo a la ventana
        top: 0, 
        left: 0,
        zIndex: -1 // Se asegura de estar DETRÁS de todo
      }}
    />
  );
};

export default FondoAnimado;