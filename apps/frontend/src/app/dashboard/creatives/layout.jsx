// Ubicación: DCO/apps/frontend/src/app/dashboard/creatives/layout.jsx
import Link from 'next/link';
import estilos from './CreativesLayout.module.scss';

export default function CreativesLayout({ children }) {
  return (
    <div>
      <nav className={estilos.subMenu}>
        <Link href="/dashboard/creatives">Mis Creatividades</Link>
        {/* <Link href="/dashboard/creatives/templates">Plantillas</Link> */}
        <Link href="/dashboard/creatives/data-sources">Fuentes de Datos</Link>
      </nav>
      <div className={estilos.content}>
        {children} {/* Aquí se renderizará cada página del sub-menú */}
      </div>
    </div>
  );
}