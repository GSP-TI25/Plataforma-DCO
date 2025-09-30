// Ubicación: DCO/apps/frontend/src/app/dashboard/clients/page.jsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import estilos from './ClientsPage.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { obtenerClientes, eliminarCliente } from '@/lib/api';
import { LuCirclePlus, LuPencil, LuTrash2, LuSlidersHorizontal  } from 'react-icons/lu';
import Modal from '@/components/ui/Modal/Modal';
import FormularioCliente from '@/components/clients/FormularioCliente';
import Paginacion from '@/components/ui/Paginacion/Paginacion';

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [modalFormularioAbierto, setModalFormularioAbierto] = useState(false);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [clienteABorrar, setClienteABorrar] = useState(null);
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

  const cargarClientes = async (page) => {
    if (!token) return;
    setEstaCargando(true);
    try {
      const data = await obtenerClientes(token, page);
      setClients(data.clients);
      setTotalPaginas(Math.ceil(data.totalClients / 8));
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    } finally {
      setEstaCargando(false);
    }
  };

  useEffect(() => {
    cargarClientes(paginaActual);
  }, [token, paginaActual]);

  const handleGuardado = () => {
    setModalFormularioAbierto(false);
    cargarClientes(paginaActual);
  };

  const iniciarProcesoDeBorrado = (cliente) => setClienteABorrar(cliente);

  const confirmarBorrado = async () => {
    if (!clienteABorrar) return;
    setEstaCargando(true);
    try {
      await eliminarCliente(clienteABorrar.id, token);
      cargarClientes(paginaActual);
      setClienteABorrar(null);
    } catch (error) {
      console.error('Error al borrar cliente:', error);
    } finally {
      setEstaCargando(false);
    }
  };

  const abrirModalParaCrear = () => {
    setClienteSeleccionado(null);
    setModalFormularioAbierto(true);
  };

  const abrirModalParaEditar = (cliente) => {
    setClienteSeleccionado(cliente);
    setModalFormularioAbierto(true);
  };

  return (
    <div>
      <header className={estilos.header}>
        <h1>Clientes</h1>
        <button className={estilos.botonCrear} onClick={abrirModalParaCrear}>
          <LuCirclePlus />
          <span>Añadir Cliente</span>
        </button>
      </header>

      <div className={estilos.contenedorTabla}>
        <table className={estilos.tabla}>
          <thead>
            <tr>
              <th>Nombre Cliente</th>
              <th>Contacto</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td>{client.name}</td>
                <td>{client.contact_person}</td>
                <td>{client.contact_email}</td>
                <td><span className={`${estilos.badge} ${client.is_active ? estilos.active : estilos.inactive}`}>{client.is_active ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                  <div className={estilos.botonesAccion}>
                    <Link href={`/dashboard/clients/${client.id}`} className={`${estilos.botonIcono} ${estilos.botonVer}`}>
                      <LuSlidersHorizontal  />
                    </Link>
                    <button onClick={() => abrirModalParaEditar(client)} className={`${estilos.botonIcono} ${estilos.botonEditar}`}><LuPencil /></button>
                    <button onClick={() => iniciarProcesoDeBorrado(client)} className={`${estilos.botonIcono} ${estilos.botonBorrar}`}><LuTrash2 /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Paginacion paginaActual={paginaActual} totalPaginas={totalPaginas} enCambioDePagina={setPaginaActual} />
      </div>

      <Modal titulo={clienteSeleccionado ? 'Editar Cliente' : 'Crear Nuevo Cliente'} estaAbierto={modalFormularioAbierto} alCerrar={() => setModalFormularioAbierto(false)}>
        <FormularioCliente onGuardado={handleGuardado} clienteAEditar={clienteSeleccionado} />
      </Modal>

      <Modal titulo="Confirmar Eliminación" estaAbierto={!!clienteABorrar} alCerrar={() => setClienteABorrar(null)}>
        <div className={estilos.contenidoConfirmacion}>
          <p>¿Estás seguro de que quieres eliminar al cliente <strong>{clienteABorrar?.name}</strong>?</p>
          <div className={estilos.accionesConfirmacion}>
            <button className={estilos.botonCancelar} onClick={() => setClienteABorrar(null)}>Cancelar</button>
            <button className={estilos.botonConfirmarBorrado} onClick={confirmarBorrado}>Sí, Eliminar</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}