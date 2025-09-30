// Ubicación: DCO/apps/frontend/src/app/dashboard/settings/page.jsx

'use client';
import { useState, useEffect,useCallback  } from 'react';
import estilos from './SettingsPage.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { obtenerUsuarios, eliminarUsuario } from '@/lib/api';
import { LuCirclePlus, LuPencil, LuTrash2,LuSearch } from 'react-icons/lu';
import Modal from '@/components/ui/Modal/Modal';
import FormularioUsuario from '@/components/users/FormularioUsuario';
import Paginacion from '@/components/ui/Paginacion/Paginacion';

export default function SettingsPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [usuarioABorrar, setUsuarioABorrar] = useState(null);
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

  const cargarUsuarios = useCallback(async (page, search) => {
    if (!token) return;
    setEstaCargando(true);
    try {
      const data = await obtenerUsuarios(token, page, search);
      setUsuarios(data.users);
      setTotalPaginas(Math.ceil(data.totalUsers / 8));
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    } finally {
      setEstaCargando(false);
    }
  }, [token, setEstaCargando]);

  useEffect(() => {
    // Debounce para la búsqueda
    const delayDebounceFn = setTimeout(() => {
      cargarUsuarios(1, searchTerm);
      if (paginaActual !== 1) setPaginaActual(1);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, cargarUsuarios]);

  useEffect(() => {
    // Carga de datos al cambiar de página
    cargarUsuarios(paginaActual, searchTerm);
  }, [token, paginaActual]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleGuardado = () => {
    setModalFormularioAbierto(false);
    cargarUsuarios();
  };

  const handleBorrar = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      setEstaCargando(true);
      try {
        await eliminarUsuario(id, token);
        cargarUsuarios();
      } catch (error) {
        console.error('Error al borrar usuario:', error);
      } finally {
        setEstaCargando(false);
      }
    }
  };

  const iniciarProcesoDeBorrado = (usuario) => {
    setUsuarioABorrar(usuario);
  };

  const confirmarBorrado = async () => {
    if (!usuarioABorrar) return;

    setEstaCargando(true);
    try {
      await eliminarUsuario(usuarioABorrar.id, token);
      cargarUsuarios(); // Refrescamos la lista
      setUsuarioABorrar(null); // Cerramos el modal
    } catch (error) {
      console.error('Error al borrar usuario:', error);
      alert('No se pudo eliminar el usuario.');
    } finally {
      setEstaCargando(false);
    }
  };

  const abrirModalParaCrear = () => {
    setUsuarioSeleccionado(null);
    setModalFormularioAbierto(true);
  };

  const abrirModalParaEditar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalFormularioAbierto(true);
  };

  return (
    <div>
      <header className={estilos.header}>
        <h1>Gestión de Usuarios</h1>
        <button className={estilos.botonCrear} onClick={abrirModalParaCrear}>
          <LuCirclePlus />
          <span>Crear Usuario</span>
        </button>
      </header>

      <div className={estilos.searchBar}>
        <LuSearch className={estilos.searchIcon} />
        <input 
          type="text"
          placeholder="Buscar por nombre, apellido o email..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      <div className={estilos.contenedorTabla}>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th>Nombre Completo</th>
              <th>Correo Electrónico</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{`${usuario.first_name} ${usuario.last_name}`}</td>
                <td>{usuario.email}</td>
                <td><span className={`${estilos.badge} ${estilos[usuario.role]}`}>{usuario.role}</span></td>
                <td>
                  <div className={estilos.botonesAccion}>
                    <button onClick={() => abrirModalParaEditar(usuario)} className={`${estilos.botonIcono} ${estilos.botonEditar}`}>
                      <LuPencil />
                    </button>
                    <button onClick={() => iniciarProcesoDeBorrado(usuario)} className={`${estilos.botonIcono} ${estilos.botonBorrar}`}>
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
        titulo={usuarioSeleccionado ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
        estaAbierto={modalFormularioAbierto}
        alCerrar={() => setModalFormularioAbierto(false)}
      >
        <FormularioUsuario
          onGuardado={handleGuardado}
          usuarioAEditar={usuarioSeleccionado}
        />
      </Modal>
      <Modal
        titulo="Confirmar Eliminación"
        estaAbierto={!!usuarioABorrar} // Se muestra si 'usuarioABorrar' no es null
        alCerrar={() => setUsuarioABorrar(null)} // Se cierra poniendo el estado a null
      >
        <div className={estilos.contenidoConfirmacion}>
          <p>
            ¿Estás seguro de que quieres eliminar al usuario 
            <strong> {usuarioABorrar?.first_name} {usuarioABorrar?.last_name}</strong>?
          </p>
          <p className={estilos.advertencia}>Esta acción no se puede deshacer.</p>
          <div className={estilos.accionesConfirmacion}>
            <button 
              className={estilos.botonCancelar} 
              onClick={() => setUsuarioABorrar(null)}
            >
              Cancelar
            </button>
            <button 
              className={estilos.botonConfirmarBorrado}
              onClick={confirmarBorrado}
            >
              Sí, Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}