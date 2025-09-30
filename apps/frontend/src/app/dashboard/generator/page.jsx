// Ubicación: DCO/apps/frontend/src/app/dashboard/generator/page.jsx
'use client';
import { useState, useEffect } from 'react';
import estilos from './GeneratorPage.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { obtenerPlantillas, obtenerFuentesDeDatos, generarCreatividad } from '@/lib/api';
import Modal from '@/components/ui/Modal/Modal'; // <-- Importamos el Modal

export default function GeneratorPage() {
  const [plantillas, setPlantillas] = useState([]);
  const [fuentes, setFuentes] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState('');
  const [fuenteSeleccionada, setFuenteSeleccionada] = useState(null);
  
  // --- Estados para el modal de resultado ---
  const [modalResultadoAbierto, setModalResultadoAbierto] = useState(false);
  const [imagenGeneradaUrl, setImagenGeneradaUrl] = useState('');
  
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      if (!token) return;
      setEstaCargando(true);
      try {
        const [dataPlantillas, dataFuentes] = await Promise.all([
          obtenerPlantillas(token),
          obtenerFuentesDeDatos(token)
        ]);
        setPlantillas(dataPlantillas);
        setFuentes(dataFuentes);
      } catch (error) {
        console.error(error);
      } finally {
        setEstaCargando(false);
      }
    };
    cargarDatosIniciales();
  }, [token, setEstaCargando]);
      
  const handleSeleccionarFuente = (idFuente) => {
    const fuente = fuentes.find(f => f.id === idFuente);
    setFuenteSeleccionada(fuente);
  };

  const handleGenerar = async (filaDeDatos) => {
    if (!plantillaSeleccionada) {
      alert('Por favor, selecciona primero una plantilla.');
      return;
    }
    setEstaCargando(true);
    try {
      const result = await generarCreatividad({
        templateId: plantillaSeleccionada,
        dataRow: filaDeDatos,
      }, token);
      setImagenGeneradaUrl(result.imageUrl);
      setModalResultadoAbierto(true); // ¡Abrimos el modal!
    } catch (error) {
      console.error(error);
      alert('Hubo un error al generar la imagen.');
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <div>
      <header className={estilos.header}>
        <h1>Generador de Creatividades</h1>
      </header>

      <div className={estilos.panelConfiguracion}>
        <div className={estilos.grupoSelect}>
          <label htmlFor="plantilla">1. Selecciona una Plantilla</label>
          <select id="plantilla" value={plantillaSeleccionada} onChange={(e) => setPlantillaSeleccionada(e.target.value)}>
            <option value="">-- Elige una plantilla --</option>
            {plantillas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div className={estilos.grupoSelect}>
          <label htmlFor="fuente">2. Selecciona una Fuente de Datos</label>
          <select id="fuente" onChange={(e) => handleSeleccionarFuente(e.target.value)} defaultValue="">
            <option value="">-- Elige una fuente de datos --</option>
            {fuentes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>
      </div>

      {fuenteSeleccionada && (
        <div className={estilos.panelDatos}>
          <h2>Datos de: {fuenteSeleccionada.name}</h2>
          {fuenteSeleccionada.data && Array.isArray(fuenteSeleccionada.data) && fuenteSeleccionada.data.length > 0 ? (
          <div className={estilos.contenedorTabla}>
            <table className={estilos.tabla}>
              <thead>
                <tr>
                  {Object.keys(fuenteSeleccionada.data[0]).map(key => <th key={key}>{key}</th>)}
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {fuenteSeleccionada.data.map((fila, index) => (
                  <tr key={index}>
                    {Object.values(fila).map((valor, i) => <td key={i}>{valor}</td>)}
                    <td>
                      <button onClick={() => handleGenerar(fila)} className={estilos.botonGenerar}>
                        Generar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
           ) : (
            <p>Esta fuente de datos no contiene elementos.</p>
          )}
        </div>
      )}

      {/* --- NUEVO MODAL PARA MOSTRAR EL RESULTADO --- */}
      <Modal
        titulo="¡Creatividad Generada!"
        estaAbierto={modalResultadoAbierto}
        alCerrar={() => setModalResultadoAbierto(false)}
      >
        <div className={estilos.resultadoContenido}>
          <img src={imagenGeneradaUrl} alt="Creatividad generada" className={estilos.imagenResultado} />
          <a 
            href={imagenGeneradaUrl} 
            download
            className={estilos.botonDescargar}
          >
            Descargar Imagen
          </a>
        </div>
      </Modal>
    </div>
  );
}