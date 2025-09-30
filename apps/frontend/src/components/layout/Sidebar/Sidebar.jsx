// Ubicación: DCO/apps/frontend/src/components/layout/Sidebar/Sidebar.jsx
'use client';
import Link from 'next/link';
import estilos from './Sidebar.module.scss';
import { LuLayoutDashboard, LuMegaphone, LuPalette, LuChartLine, LuSettings, LuZap, LuImage, LuUsers,LuClipboardList } from "react-icons/lu";
import { usarAuth } from '@/contexto/ContextoAuth'

export default function Sidebar() {

  const { usuario } = usarAuth();

  return (
    <aside className={estilos.sidebar}>
      <div className={estilos.logo}>
        MOOD DCO
      </div>
      <nav className={estilos.nav}>
        <Link href="/dashboard" className={estilos.navLink}>
          <LuLayoutDashboard /> <span>Dashboard</span>
        </Link>
        <Link href="/dashboard/clients" className={estilos.navLink}>
          <LuUsers /> <span>Clientes</span>
        </Link>
        <Link href="/dashboard/planner" className={estilos.navLink}>
          <LuClipboardList /> <span>Planificador</span>
        </Link>
        <Link href="/dashboard/campaigns" className={estilos.navLink}>
          <LuMegaphone /> <span>Campañas</span>
        </Link>
        <Link href="/dashboard/creatives" className={estilos.navLink}>
          <LuPalette /> <span>Creatividades</span>
        </Link>
        <Link href="/dashboard/assets" className={estilos.navLink}>
          <LuImage /> <span>Biblioteca de Activos</span>
        </Link>
        {/* <Link href="/dashboard/generator" className={estilos.navLink}>
          <LuZap /> <span>Generador</span>
        </Link> */}
        <Link href="/dashboard/reports" className={estilos.navLink}>
          <LuChartLine /> <span>Reportes</span>
        </Link>
      </nav>
      <div className={estilos.footerNav}>
        {usuario && usuario.role === 'admin' && (
          <Link href="/dashboard/settings" className={estilos.navLink}>
            <LuSettings /> <span>Configuración</span>
          </Link>
        )}
      </div>
    </aside>
  );
}