// Ubicación: DCO/apps/frontend/src/app/layout.jsx
'use client'; // Necesario porque los proveedores usan hooks
import { ProveedorDeCarga } from '@/contexto/ContextoCarga';
import { ProveedorDeAuth } from '@/contexto/ContextoAuth';
import QueryProvider from '@/components/QueryProvider';
import './globals.css';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <QueryProvider>
          <ProveedorDeAuth>
            <ProveedorDeCarga>
              {children}
            </ProveedorDeCarga>
          </ProveedorDeAuth>
        </QueryProvider>
      </body>
    </html>
  );
}