// Ubicación: DCO/apps/frontend/src/contexto/ContextoAuth.jsx

'use client';
import { createContext, useState, useContext, useEffect } from 'react';
import { usarCarga } from './ContextoCarga';
import { jwtDecode } from 'jwt-decode';
const ContextoDeAuth = createContext();

export const ProveedorDeAuth = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [token, setToken] = useState(null);
  const [cargandoAuth, setCargandoAuth] = useState(true);

  // Este efecto se ejecuta una sola vez cuando la app carga
  useEffect(() => {
    try {
      const tokenGuardado = localStorage.getItem('authToken');
      if (tokenGuardado) {
        // 2. Decodificamos el token para extraer los datos del usuario
        const datosUsuario = jwtDecode(tokenGuardado);

        // 3. Restauramos AMBOS, el token y el objeto de usuario
        setToken(tokenGuardado);
        setUsuario(datosUsuario);
      }
    } catch (error) {
      console.error("No se pudo procesar el token guardado", error);
      // Si el token es inválido, lo limpiamos
      localStorage.removeItem('authToken');
    } finally {
      setCargandoAuth(false);
    }
  }, []);

  const iniciarSesion = (datosDeLogin) => {
    // La información del usuario ya viene completa desde el backend
    const datosUsuario = jwtDecode(datosDeLogin.token);
    setUsuario(datosUsuario);
    setToken(datosDeLogin.token);
    localStorage.setItem('authToken', datosDeLogin.token);
  };

  const cerrarSesion = () => {
    setUsuario(null);
    setToken(null);
    // Eliminamos el token de la "caja fuerte"
    localStorage.removeItem('authToken');
  };

  return (
    <ContextoDeAuth.Provider value={{ usuario, token, cargandoAuth, iniciarSesion, cerrarSesion }}>
      {/* Mostramos los hijos solo cuando la autenticación inicial ha terminado de cargar */}
      {!cargandoAuth && children}
    </ContextoDeAuth.Provider>
  );
};

export const usarAuth = () => useContext(ContextoDeAuth);