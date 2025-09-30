// Ubicación: DCO/apps/frontend/src/app/dashboard/layout.jsx
import Sidebar from '@/components/layout/Sidebar/Sidebar';
import Header from '@/components/layout/Header/Header';
import estilos from './DashboardLayout.module.scss';

export default function DashboardLayout({ children }) {
  return (
    <div className={estilos.dashboardLayout}>
      <Sidebar />
      <div className={estilos.mainContent}>
        <Header />
        <main className={estilos.pageContent}>
          {children}
        </main>
      </div>
    </div>
  );
}