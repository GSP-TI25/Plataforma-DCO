//Ubicacion: DCO/apps/frontend/src/app/(public)/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import estilos from './HomePage.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { loginUsuario } from '@/lib/api';
import dynamic from 'next/dynamic';

const FondoAnimado = dynamic(() => import('@/components/layout/FondoAnimado'), {
  ssr: false,
});

const vantaOptions = {
  color: 0xbbbbbb,
  backgroundColor: 0x191919,
  points: 12.00,
  maxDistance: 22.00,
  spacing: 18.00
};

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setEstaCargando } = usarCarga();
  const { iniciarSesion } = usarAuth();
  const router = useRouter();

   useEffect(() => {
    // Le decimos a Next.js que empiece a cargar el código del dashboard en segundo plano
    router.prefetch('/dashboard');
  }, [router]);

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setError('');
    setEstaCargando(true);
    try {
      const datos = await loginUsuario(email, password);
      iniciarSesion(datos);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message || 'Credenciales incorrectas. Inténtalo de nuevo.');
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <>
      <FondoAnimado effect="NET" options={vantaOptions} />
      <div className={estilos.container}>
        <div className={estilos.loginCard}>
          <div className={estilos.cardHeader}>
            <h1 className={estilos.title}>Bienvenido</h1>
            <p className={estilos.subtitle}>Inicia sesión para continuar</p>
          </div>
          <form onSubmit={handleSubmit} className={estilos.loginForm}>
            <div className={estilos.formGroup}>
              <input 
                type="email" 
                id="email" 
                name="email" 
                required 
                placeholder=" "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email">Correo Electrónico</label>
            </div>
            <div className={estilos.formGroup}>
              <input 
                type="password" 
                id="password" 
                name="password" 
                required 
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password">Contraseña</label>
            </div>
            {error && <p className={estilos.errorMessage}>{error}</p>}
            <button type="submit" className={estilos.submitButton}>
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
