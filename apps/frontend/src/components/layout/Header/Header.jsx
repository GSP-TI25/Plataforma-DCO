// Ubicación: DCO/apps/frontend/src/components/layout/Header/Header.jsx

'use client';
import { useState, useEffect, useRef } from 'react'; // Importamos más hooks
import estilos from './Header.module.scss';
import { LuCircleUser, LuLogOut } from "react-icons/lu";
import { usarAuth } from '@/contexto/ContextoAuth';
import { useRouter } from 'next/navigation';

export default function Header() {
  const { usuario, cerrarSesion } = usarAuth();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false); // Estado para controlar el menú
  const menuRef = useRef(null); // Referencia para detectar clics fuera

  const handleLogout = () => {
    cerrarSesion();
    router.push('/');
  };

  // Hook para cerrar el menú si se hace clic fuera de él
  useEffect(() => {
    const handleClickOutside = (evento) => {
      if (menuRef.current && !menuRef.current.contains(evento.target)) {
        setMenuAbierto(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <header className={estilos.header}>
      <div className={estilos.userProfileContainer} ref={menuRef}>
        <button onClick={() => setMenuAbierto(!menuAbierto)} className={estilos.userProfile}>
          <LuCircleUser className={estilos.userIcon} />
          <span>{usuario?.first_name || 'Usuario'}</span>
        </button>

        {/* El menú desplegable solo se muestra si menuAbierto es true */}
        {menuAbierto && (
          <div className={estilos.dropdownMenu}>
            <button onClick={handleLogout} className={estilos.dropdownItem}>
              <LuLogOut />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}