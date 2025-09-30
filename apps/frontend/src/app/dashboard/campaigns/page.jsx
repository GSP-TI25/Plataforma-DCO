// Ubicacion: DCO/apps/frontend/src/app/dashboard/campaigns/page.jsx

'use client';
import { useState, useEffect, useCallback  } from 'react';
import Link from 'next/link';
import estilos from './CampaignsPage.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { obtenerCampañas, eliminarCampaña  } from '@/lib/api';
import { LuCirclePlus, LuPencil, LuTrash2, LuEye, LuSearch  } from 'react-icons/lu';
import Modal from '@/components/ui/Modal/Modal';
import FormularioCampaña from '@/components/campaigns/FormularioCampaña';
import Paginacion from '@/components/ui/Paginacion/Paginacion';

export default function CampaignsPage() {
  const [campañas, setCampañas] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [campañaSeleccionada, setCampañaSeleccionada] = useState(null);
  const [campañaABorrar, setCampañaABorrar] = useState(null);
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

  const cargarCampañas = useCallback(async (page, search) => {
    if (!token) return;
    setEstaCargando(true);
    try {
      const data = await obtenerCampañas(token, page, search);
      setCampañas(data.campaigns);
      setTotalPaginas(Math.ceil(data.totalCampaigns / 8));
    } catch (error) {
      console.error(error);
    } finally {
      setEstaCargando(false);
    }
  }, [token, setEstaCargando]);

  useEffect(() => {
    cargarCampañas(paginaActual, searchTerm);
  }, [token, paginaActual, cargarCampañas]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPaginaActual(1); // Reseteamos a la página 1 en cada nueva búsqueda
  };
  
  useEffect(() => {
    // Usamos un 'debounce' para no llamar a la API en cada letra que se escribe
    const delayDebounceFn = setTimeout(() => {
      cargarCampañas(1, searchTerm);
    }, 500); // Espera 500ms después de que el usuario deja de escribir

    return () => clearTimeout(delayDebounceFn); // Limpia el temporizador
  }, [searchTerm, cargarCampañas]);

  const handleCampañaGuardada = () => {
    setModalFormularioAbierto(false);
    cargarCampañas();
  };

  const iniciarProcesoDeBorrado = (campaña) => {
    setCampañaABorrar(campaña);
  };

  const confirmarBorrado = async () => {
    if (!campañaABorrar) return;
    setEstaCargando(true);
    try {
      await eliminarCampaña(campañaABorrar.id, token);
      cargarCampañas();
      setCampañaABorrar(null); // Cerramos el modal
    } catch (error) {
      console.error('Error al borrar campaña:', error);
    } finally {
      setEstaCargando(false);
    }
  };

  const handleBorrar = async (id) => {
    // Pedimos confirmación al usuario
    if (window.confirm('¿Estás seguro de que quieres eliminar esta campaña?')) {
      setEstaCargando(true);
      try {
        await eliminarCampaña(id, token);
        cargarCampañas(); // Refrescamos la lista para que desaparezca la campaña borrada
      } catch (error) {
        console.error('Error al borrar campaña:', error);
        // Aquí podríamos mostrar un mensaje de error
      } finally {
        setEstaCargando(false);
      }
    }
  };

  const abrirModalParaCrear = () => {
    setCampañaSeleccionada(null);
    setModalFormularioAbierto(true);
  };

  const abrirModalParaEditar = (campaña) => {
    setCampañaSeleccionada(campaña);
    setModalFormularioAbierto(true);
  };


  return (
    <div>
      <header className={estilos.header}>
        <h1>Campañas</h1>
        <button className={estilos.botonCrear} onClick={abrirModalParaCrear}>
          <LuCirclePlus />
          <span>Crear Campaña</span>
        </button>
      </header>
      
      <div className={estilos.searchBar}>
        <LuSearch className={estilos.searchIcon} />
        <input 
          type="text"
          placeholder="Buscar campañas por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className={estilos.contenedorTabla}>
        <table className={estilos.tablaCampañas}>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Fecha de Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {campañas.map((campaña) => (
              <tr key={campaña.id}>
                <td>{campaña.name}</td>
                <td><span className={`${estilos.badge} ${estilos[campaña.status]}`}>{campaña.status}</span></td>
                <td>{new Date(campaña.created_at).toLocaleDateString('es-PE')}</td>
                <td>
                  <div className={estilos.botonesAccion}>
                    {/* --- 4. AÑADIMOS EL BOTÓN DE VER --- */}
                    <Link href={`/dashboard/campaigns/${campaña.id}`} className={`${estilos.botonIcono} ${estilos.botonVer}`}>
                      <LuEye />
                    </Link>
                    <button onClick={() => abrirModalParaEditar(campaña)} className={`${estilos.botonIcono} ${estilos.botonEditar}`}>
                      <LuPencil />
                    </button>
                    {/* 3. El botón de borrar ahora abre el modal */}
                    <button onClick={() => iniciarProcesoDeBorrado(campaña)} className={`${estilos.botonIcono} ${estilos.botonBorrar}`}>
                      <LuTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Paginacion 
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          enCambioDePagina={setPaginaActual}
        />
      </div>
      <Modal
        titulo={campañaSeleccionada ? 'Editar Campaña' : 'Crear Nueva Campaña'}
        estaAbierto={modalFormularioAbierto}
        alCerrar={() => setModalFormularioAbierto(false)}
      >
        <FormularioCampaña
          onCampañaGuardada={handleCampañaGuardada}
          campañaAEditar={campañaSeleccionada}
        />
      </Modal>
      <Modal
        titulo="Confirmar Eliminación"
        estaAbierto={!!campañaABorrar}
        alCerrar={() => setCampañaABorrar(null)}
      >
        <div className={estilos.contenidoConfirmacion}>
          <p>¿Estás seguro de que quieres eliminar la campaña <strong>{campañaABorrar?.name}</strong>?</p>
          <p className={estilos.advertencia}>Esta acción no se puede deshacer.</p>
          <div className={estilos.accionesConfirmacion}>
            <button className={estilos.botonCancelar} onClick={() => setCampañaABorrar(null)}>
              Cancelar
            </button>
            <button className={estilos.botonConfirmarBorrado} onClick={confirmarBorrado}>
              Sí, Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}