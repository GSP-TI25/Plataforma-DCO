//Ubicacion: DCO/apps/frontend/src/app/dashboard/clients/[id]/page.jsx

'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { LuArrowLeft, LuTrash2, LuFacebook, LuCloudDownload, LuCirclePlus, LuEye } from 'react-icons/lu';
import estilos from './ClientDetailPage.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { obtenerCredencialesCliente, eliminarCredencial, obtenerCuentasPublicitarias, obtenerCampañasDeMeta, eliminarCampañaDeMeta  } from '@/lib/api';
import Modal from '@/components/ui/Modal/Modal';
import FormularioCampañaMeta from '@/components/clients/FormularioCampañaMeta';

export default function ClientDetailPage() {
  const [credentials, setCredentials] = useState([]);
  const [adAccounts, setAdAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [modalCampañaAbierto, setModalCampañaAbierto] = useState(false);
  const params = useParams();
  const router = useRouter();
  const { token } = usarAuth();
  const { setEstaCargando } = usarCarga();
  const clientId = params.id;

  const cargarCredenciales = async () => {
    if (!token || !clientId) return;
    setEstaCargando(true);
    try {
      const credsData = await obtenerCredencialesCliente(clientId, token);
      setCredentials(credsData);
    } catch (error) {
      console.error("Error al cargar las credenciales:", error);
    } finally {
      setEstaCargando(false);
    }
  };

  useEffect(() => {
    cargarCredenciales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, clientId]);

  const handleBorrarCredencial = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta conexión?')) {
      setEstaCargando(true);
      try {
        await eliminarCredencial(id, token);
        cargarCredenciales();
        setAdAccounts([]);
        setCampaigns([]);
        setSelectedAccount(null);
      } catch (error) {
        console.error("Error al eliminar credencial:", error);
      } finally {
        setEstaCargando(false);
      }
    }
  };

  const handleCargarCuentas = async () => {
    setEstaCargando(true);
    try {
      const data = await obtenerCuentasPublicitarias(clientId, token);
      setAdAccounts(data);
      setCampaigns([]);
      setSelectedAccount(null);
    } catch (error) {
      console.error("Error al cargar cuentas:", error);
      alert('No se pudieron cargar las cuentas. Verifica que el token sea válido y tenga permisos.');
    } finally {
      setEstaCargando(false);
    }
  };

  const handleVerCampañas = async (account) => {
    setSelectedAccount(account);
    setEstaCargando(true);
    try {
      const data = await obtenerCampañasDeMeta(clientId, account.id, token);
      setCampaigns(data);
    } catch (error) {
      console.error("Error al cargar campañas de Meta:", error);
      alert('No se pudieron cargar las campañas.');
    } finally {
      setEstaCargando(false);
    }
  };
  
  const handleCampañaGuardada = () => {
    setModalCampañaAbierto(false);
    if (selectedAccount) {
      handleVerCampañas(selectedAccount);
    }
  };

  const handleBorrarCampaña = async (campaignId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta campaña de Meta? Esta acción es permanente.')) {
      setEstaCargando(true);
      try {
        await eliminarCampañaDeMeta(clientId, campaignId, token);
        // Volvemos a cargar las campañas para que la eliminada desaparezca
        if (selectedAccount) {
          handleVerCampañas(selectedAccount);
        }
      } catch (error) {
        console.error("Error al eliminar campaña de Meta:", error);
        alert('No se pudo eliminar la campaña.');
      } finally {
        setEstaCargando(false);
      }
    }
  };

  return (
    <div className={estilos.detailContainer}>
      <div className={estilos.actionsHeader}>
        <button onClick={() => router.back()} className={estilos.botonRegresar}>
          <LuArrowLeft />
          <span>Volver a Clientes</span>
        </button>
      </div>

      <header className={estilos.header}>
        <h1>Gestionar Conexiones</h1>
      </header>

      <div className={`${estilos.card} ${estilos.cardConexiones}`}>
        <div className={estilos.cardHeader}>
          <h2>Conexiones de API</h2>
          <a
            href={`http://localhost:8080/api/v1/auth/facebook?clientId=${clientId}`}
            className={estilos.botonAñadir}
          >
            <LuFacebook />
            Conectar con Meta
          </a>
        </div>
        <div className={estilos.cardContent}>
          <table className={estilos.tablaCredenciales}>
            <thead>
              <tr>
                <th>Plataforma</th>
                <th>Token Guardado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {credentials.map(cred => (
                <tr key={cred.id}>
                  <td>
                    <span className={`${estilos.platformBadge} ${estilos[cred.platform]}`}>{cred.platform}</span>
                  </td>
                  <td>************{cred.access_token.slice(-4)}</td>
                  <td>
                    <button onClick={() => handleBorrarCredencial(cred.id)} className={estilos.botonBorrar}><LuTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {credentials.length === 0 && (
            <p className={estilos.mensajeVacio}>Aún no hay conexiones para este cliente.</p>
          )}
        </div>
      </div>

      <div className={estilos.card}>
        <div className={estilos.cardHeader}>
          <h2>Cuentas Publicitarias</h2>
          <button className={estilos.botonCargar} onClick={handleCargarCuentas} disabled={credentials.length === 0}>
            <LuCloudDownload />
            Cargar Cuentas
          </button>
        </div>
        <div className={estilos.cardContent}>
          <ul className={estilos.listaCuentas}>
            {adAccounts.map(account => (
              <li key={account.id} className={`${estilos.accountItem} ${selectedAccount?.id === account.id ? estilos.selected : ''}`}>
                <div className={estilos.accountInfo}>
                  <span>{account.name} (ID: {account.id})</span>
                  <span className={`${estilos.statusBadge} ${estilos['status_' + account.account_status]}`}>
                    {account.account_status === 1 ? 'Activa' : 'Inactiva'}
                  </span>
                </div>
                <button className={estilos.botonVerCampañas} onClick={() => handleVerCampañas(account)}>
                  Ver Campañas
                </button>
              </li>
            ))}
          </ul>
          {adAccounts.length === 0 && (
            <p className={estilos.mensajeVacio}>Haz clic en "Cargar Cuentas" para ver las cuentas publicitarias de este cliente.</p>
          )}
        </div>
      </div>

      {selectedAccount && (
        <div className={`${estilos.card} ${estilos.cardCampañas}`}>
          <div className={estilos.cardHeader}>
            <h3>Campañas de: {selectedAccount.name}</h3>
            <button className={estilos.botonAñadir} onClick={() => setModalCampañaAbierto(true)}>
              <LuCirclePlus />
              Crear Campaña
            </button>
          </div>
          <div className={estilos.cardContent}>
            <table className={estilos.tablaCredenciales}>
              <thead>
                <tr>
                  <th>Nombre Campaña</th>
                  <th>Objetivo</th>
                  <th>Estado</th>
                  <th>Acciones</th> 
                </tr>
              </thead>
              <tbody>
                {campaigns.map(camp => (
                  <tr key={camp.id}>
                    <td>{camp.name}</td>
                    <td>{camp.objective}</td>
                    <td><span className={`${estilos.statusBadge} ${estilos[camp.effective_status?.toLowerCase()]}`}>{camp.status}</span></td>
                    <td>
                      <div className={estilos.botonesAccion}>
                        <Link 
                          href={`/dashboard/campaigns/${camp.id}/adsets?clientId=${clientId}&adAccountId=${selectedAccount.id}&campaignName=${encodeURIComponent(camp.name)}`}
                          title="Ver/Gestionar Conjuntos de Anuncios" 
                          className={`${estilos.botonIcono} ${estilos.botonVer}`}
                        >
                          <LuEye />
                        </Link>
                        <button title="Eliminar Campaña en Meta" onClick={() => handleBorrarCampaña(camp.id)} className={`${estilos.botonIcono} ${estilos.botonBorrar}`}><LuTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {campaigns.length === 0 && (
              <p className={estilos.mensajeVacio}>No se encontraron campañas para esta cuenta publicitaria.</p>
            )}
          </div>
        </div>
      )}
      
      <Modal titulo="Crear Nueva Campaña en Meta" estaAbierto={modalCampañaAbierto} alCerrar={() => setModalCampañaAbierto(false)}>
        <FormularioCampañaMeta
          onGuardado={handleCampañaGuardada}
          clientId={clientId}
          adAccountId={selectedAccount?.id}
        />
      </Modal>
    </div>
  );
}
