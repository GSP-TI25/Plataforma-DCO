// Ubicación: DCO/apps/frontend/src/app/dashboard/creatives/page.jsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import estilos from './CreativesPage.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { obtenerCreatividades, obtenerCampañas, eliminarCreatividad } from '@/lib/api'; 
import { LuCirclePlus, LuPencil, LuTrash2,LuEye, LuSearch   } from 'react-icons/lu';
import Modal from '@/components/ui/Modal/Modal';
import FormularioCreatividad from '@/components/creatives/FormularioCreatividad'; 
import Paginacion from '@/components/ui/Paginacion/Paginacion'; 

export default function CreativesPage() {
  const [creatives, setCreatives] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [campañas, setCampañas] = useState([]);
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [creatividadSeleccionada, setCreatividadSeleccionada] = useState(null);
  const [creatividadABorrar, setCreatividadABorrar] = useState(null);
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

  const cargarDatos = useCallback(async (page, search) => {
    if (!token) return;
    setEstaCargando(true);
    try {
      // Pedimos las creatividades con paginación y búsqueda
      const dataCreativas = await obtenerCreatividades(token, page, search);
      setCreatives(dataCreativas.creatives);
      setTotalPaginas(Math.ceil(dataCreativas.totalCreatives / 8));

      // Obtenemos todas las campañas para el formulario (sin paginación)
      if (campañas.length === 0) {
        const dataCampañas = await obtenerCampañas(token, 1, 1000, '');
        setCampañas(dataCampañas.campaigns);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setEstaCargando(false);
    }
  }, [token, setEstaCargando, campañas.length]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (paginaActual !== 1) setPaginaActual(1);
      else cargarDatos(1, searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, cargarDatos]);
  
  useEffect(() => {
    cargarDatos(paginaActual, searchTerm);
  }, [token, paginaActual]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleGuardado = () => {
    setModalFormularioAbierto(false);
    cargarDatos(paginaActual, searchTerm);
  };

  const iniciarProcesoDeBorrado = (creative) => {
    setCreatividadABorrar(creative);
  };

  const confirmarBorrado = async () => {
    if (!creatividadABorrar) return;
    setEstaCargando(true);
    try {
      await eliminarCreatividad(creatividadABorrar.id, token);
      cargarDatos();
      setCreatividadABorrar(null);
    } catch (error) {
      console.error(error);
      alert('No se pudo eliminar la creatividad.');
    } finally {
      setEstaCargando(false);
    }
  };

  const abrirModalParaCrear = () => {
    setCreatividadSeleccionada(null);
    setModalFormularioAbierto(true);
  };

  const abrirModalParaEditar = (creative) => {
    setCreatividadSeleccionada(creative);
    setModalFormularioAbierto(true);
  };

  const handleBorrar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta creatividad?')) {
      setEstaCargando(true);
      try {
        await eliminarCreatividad(id, token);
        cargarDatos();
      } catch (error) {
        console.error(error);
      } finally {
        setEstaCargando(false);
      }
    }
  };

  return (
    <div>
      <header className={estilos.header}>
        <h1>Creatividades</h1>
        <button className={estilos.botonCrear} onClick={abrirModalParaCrear}>
          <LuCirclePlus /> 
          <span>Crear Creatividad</span>
        </button>
      </header>

      <div className={estilos.searchBar}>
        <LuSearch className={estilos.searchIcon} />
        <input 
          type="text"
          placeholder="Buscar creatividades por nombre..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className={estilos.contenedorTabla}>
        <table className={estilos.tablaCampañas}>
          <thead>
            <tr>
              <th>Nombre Creatividad</th>
              <th>Campaña</th>
              <th>Fecha de Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {creatives.map((creative) => (
              <tr key={creative.id}>
                <td>{creative.name}</td>
                <td>{creative.campaign_name}</td>
                <td>{new Date(creative.created_at).toLocaleDateString('es-PE')}</td>
                <td>
                  <div className={estilos.botonesAccion}>
                    <Link href={`/dashboard/creatives/${creative.id}`} className={`${estilos.botonIcono} ${estilos.botonVer}`}>
                      <LuEye />
                    </Link>
                    <button onClick={() => abrirModalParaEditar(creative)} className={`${estilos.botonIcono} ${estilos.botonEditar}`}>
                      <LuPencil />
                    </button>
                    {/* 3. El botón de borrar ahora abre el modal */}
                    <button onClick={() => iniciarProcesoDeBorrado(creative)} className={`${estilos.botonIcono} ${estilos.botonBorrar}`}>
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
        titulo={creatividadSeleccionada ? 'Editar Creatividad' : 'Crear Nueva Creatividad'}
        estaAbierto={modalFormularioAbierto}
        alCerrar={() => setModalFormularioAbierto(false)}
      >
        <FormularioCreatividad
          onGuardado={handleGuardado}
          campañas={campañas}
          creatividadAEditar={creatividadSeleccionada}
        />
      </Modal>
      <Modal
        titulo="Confirmar Eliminación"
        estaAbierto={!!creatividadABorrar}
        alCerrar={() => setCreatividadABorrar(null)}
      >
        <div className={estilos.contenidoConfirmacion}>
          <p>¿Estás seguro de que quieres eliminar la creatividad <strong>{creatividadABorrar?.name}</strong>?</p>
          <p className={estilos.advertencia}>Esta acción no se puede deshacer.</p>
          <div className={estilos.accionesConfirmacion}>
            <button className={estilos.botonCancelar} onClick={() => setCreatividadABorrar(null)}>
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