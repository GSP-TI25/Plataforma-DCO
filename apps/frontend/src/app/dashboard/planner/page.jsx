    // Ubicacion: DCO/apps/frontend/src/app/dashboard/planner/page.jsx
    'use client';
    import { useState, useEffect, useCallback } from 'react';
    import Link from 'next/link';
    import estilos from './PlannerPage.module.scss';
    import { usarCarga } from '@/contexto/ContextoCarga';
    import { usarAuth } from '@/contexto/ContextoAuth';
    import { obtenerClientes, obtenerPlanesDeContenido,eliminarPlanDeContenido  } from '@/lib/api';
    import { LuCirclePlus, LuPencil, LuTrash2 } from 'react-icons/lu';
    import Modal from '@/components/ui/Modal/Modal';
    import FormularioPlanContenido from '@/components/planner/FormularioPlanContenido';
    
    export default function PlannerPage() {
      const [clients, setClients] = useState([]);
      const [selectedClientId, setSelectedClientId] = useState('');
      const [contentPlans, setContentPlans] = useState([]);
      const [modalAbierto, setModalAbierto] = useState(false);
      const [planAEditar, setPlanAEditar] = useState(null);
      const { setEstaCargando } = usarCarga();
      const { token } = usarAuth();

      const cargarPlanes = useCallback(async () => {
        if (!selectedClientId || !token) {
          setContentPlans([]);
          return;
        };
        setEstaCargando(true);
        try {
          const data = await obtenerPlanesDeContenido(selectedClientId, token);
          setContentPlans(data);
        } catch (error) {
          console.error("Error al cargar planes de contenido:", error);
        } finally {
          setEstaCargando(false);
        }
      }, [selectedClientId, token, setEstaCargando]);
    
      // Cargar la lista de clientes para el selector
      useEffect(() => {
        const cargarClientesIniciales = async () => {
          if (!token) return;
          setEstaCargando(true);
          try {
            const data = await obtenerClientes(token, 1, 1000); // Pedimos hasta 1000 clientes
            setClients(data.clients);
            if (data.clients.length > 0) {
              setSelectedClientId(data.clients[0].id); // Seleccionamos el primero por defecto
            }
          } catch (error) {
            console.error("Error al cargar clientes:", error);
          } finally {
            setEstaCargando(false);
          }
        };
        cargarClientesIniciales();
      }, [token, setEstaCargando]);
    
      // Cargar los planes de contenido cuando se selecciona un cliente
      useEffect(() => {
        const cargarPlanes = async () => {
          if (!selectedClientId || !token) {
            setContentPlans([]);
            return;
          };
          setEstaCargando(true);
          try {
            const data = await obtenerPlanesDeContenido(selectedClientId, token);
            setContentPlans(data);
          } catch (error) {
            console.error("Error al cargar planes de contenido:", error);
          } finally {
            setEstaCargando(false);
          }
        };
        cargarPlanes();
      }, [selectedClientId, token, setEstaCargando]);

      const handleGuardado = () => {
        setModalAbierto(false);
        setPlanAEditar(null);
        cargarPlanes();
      };

      const abrirModalParaCrear = () => {
        setPlanAEditar(null);
        setModalAbierto(true);
      };
      
      const abrirModalParaEditar = (plan) => {
        setPlanAEditar(plan);
        setModalAbierto(true);
      };

       const handleBorrarPlan = async (planId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este plan de contenido?')) {
          setEstaCargando(true);
          try {
            await eliminarPlanDeContenido(planId, token);
            cargarPlanes();
          } catch (error) {
            console.error("Error al eliminar el plan:", error);
          } finally {
            setEstaCargando(false);
          }
        }
      };
    
      return (
        <div className={estilos.container}>
          <header className={estilos.header}>
            <h1>Planificador de Contenido</h1>
            <div className={estilos.clientSelector}>
              <label htmlFor="client-select">Cliente:</label>
              <select 
                id="client-select"
                value={selectedClientId}
                onChange={(e) => setSelectedClientId(e.target.value)}
              >
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
          </header>
    
          <div className={estilos.boardHeader}>
            <h2>Planes de Contenido</h2>
            <button className={estilos.botonCrear} onClick={abrirModalParaCrear}>
              <LuCirclePlus />
              <span>Crear Nuevo Plan</span>
            </button>
          </div>
    
          <div className={estilos.board}>
            {contentPlans.map(plan => (
              <div key={plan.id} className={estilos.planCard}>
                <div className={estilos.cardHeader}>
                  <Link href={`/dashboard/planner/${plan.id}`} className={estilos.planLink}>
                    <h3>{plan.name}</h3>
                  </Link>
                  <div className={estilos.cardActions}>
                    <button onClick={() => abrirModalParaEditar(plan)}><LuPencil /></button>
                    <button onClick={() => handleBorrarPlan(plan.id)}><LuTrash2 /></button>
                  </div>
                </div>
                <p>{plan.objective}</p>
                <div className={`${estilos.statusBadge} ${estilos[plan.status]}`}>
                  {plan.status.replace('_', ' ')}
                </div>
              </div>
            ))}
            {contentPlans.length === 0 && (
              <p className={estilos.mensajeVacio}>No hay planes de contenido para este cliente. ¡Crea uno!</p>
            )}
          </div>

          <Modal titulo={planAEditar ? "Editar Plan" : "Crear Nuevo Plan"} estaAbierto={modalAbierto} alCerrar={() => setModalAbierto(false)}>
            <FormularioPlanContenido
              onGuardado={handleGuardado}
              clientId={selectedClientId}
              planAEditar={planAEditar}
            />
          </Modal>
        </div>
      );
    }
    
