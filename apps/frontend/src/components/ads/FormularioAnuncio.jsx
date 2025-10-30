//Ubicación: DCO/apps/frontend/src/components/ads/FormularioAnuncio.jsx

'use client';
import { useState, useEffect } from 'react';
import estilos from './FormularioAnuncio.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { LuImagePlus, LuFileText } from "react-icons/lu";
import Modal from '@/components/ui/Modal/Modal';
import SelectorDeActivos from '@/components/estudio/SelectorDeActivos';
import SelectorDeCopys from './SelectorDeCopys'; 
import { uploadImageToMeta, createAdCreativeInMeta, createAdInMeta, obtenerPaginasDeFacebook } from '@/lib/api';
import { usarAuth } from '@/contexto/ContextoAuth';

export default function FormularioAnuncio({ onGuardado, adSetId, copysDelPlan = [], moodboardDelPlan = [], clientId, adAccountId }) {
  const [nombreAnuncio, setNombreAnuncio] = useState('');
  const [activoSeleccionado, setActivoSeleccionado] = useState(null); 
  const [copySeleccionado, setCopySeleccionado] = useState(''); 
  const [urlDestino, setUrlDestino] = useState('');
  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [paginas, setPaginas] = useState([]);
  const [paginaSeleccionada, setPaginaSeleccionada] = useState('');
  const [cargandoPaginas, setCargandoPaginas] = useState(true);
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

   
useEffect(() => {
    if (clientId && token) {
      setCargandoPaginas(true);
      obtenerPaginasDeFacebook(clientId, token)
        .then(data => {
          setPaginas(data);
          if (data.length > 0) {
            setPaginaSeleccionada(data[0].id);
          }
        })
        .catch(err => console.error("Error al cargar páginas de Facebook:", err))
        .finally(() => setCargandoPaginas(false));
    }
  }, [clientId, token]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activoSeleccionado || !copySeleccionado || !paginaSeleccionada) {
      alert("Por favor, selecciona una imagen, un texto y una página de Facebook.");
      return;
    }

    setEstaCargando(true);
    try {
      // --- PASO 1: Subir la imagen a Meta y obtener su identificador (hash) ---
      console.log("Paso 1: Subiendo imagen a Meta...");
      const { hash } = await uploadImageToMeta(clientId, adAccountId, activoSeleccionado.cloudinary_url, token);
      console.log("Imagen subida con éxito. Hash:", hash);

      // --- PASO 2: Crear la "Creatividad" del anuncio ---
      console.log("Paso 2: Creando la creatividad del anuncio...");
      const creativeData = {
        name: `Creatividad para ${nombreAnuncio}`,
        page_id: paginaSeleccionada,
        message: copySeleccionado,
        link: urlDestino,
        image_hash: hash,
      };
      const { id: creativeId } = await createAdCreativeInMeta(clientId, adAccountId, creativeData, token);
      console.log("Creatividad creada con éxito. ID:", creativeId);

      // --- PASO 3: Crear el Anuncio final ---
      console.log("Paso 3: Creando el anuncio final...");
      const adData = {
        name: nombreAnuncio,
        adset_id: adSetId,
        creative_id: creativeId,
      };
      await createAdInMeta(clientId, adAccountId, adData, token);
      
      alert("✅ ¡Éxito! El anuncio ha sido creado y enviado a Meta.");
      onGuardado();

    } catch (error) {
      console.error("Error en la secuencia de creación de anuncio:", error);
      alert(`❌ No se pudo crear el anuncio: ${error.message}`);
    } finally {
      setEstaCargando(false);
    }
  };

  const handleAssetSelect = (asset) => {
    setActivoSeleccionado(asset);
    setAssetModalOpen(false);
  };


  const handleCopySelect = (copy) => {
    setCopySeleccionado(copy);
    setCopyModalOpen(false); // Cerramos el modal
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={estilos.formulario}>
        <div className={estilos.grupoForm1}>
          <label htmlFor="nombreAnuncio">Nombre del Anuncio</label>
          <input id="nombreAnuncio" type="text" value={nombreAnuncio} onChange={(e) => setNombreAnuncio(e.target.value)} required />
        </div>
      
        <div className={estilos.grupoForm}>
          <label htmlFor="paginaFacebook">Publicar como (Página de Facebook)</label>
          <select 
            id="paginaFacebook"
            value={paginaSeleccionada}
            onChange={(e) => setPaginaSeleccionada(e.target.value)}
            disabled={cargandoPaginas || paginas.length === 0}
            required
          >
            {cargandoPaginas ? (
              <option>Cargando páginas...</option>
            ) : paginas.length > 0 ? (
              paginas.map(page => (
                <option key={page.id} value={page.id}>{page.name}</option>
              ))
            ) : (
              <option>No se encontraron páginas</option>
            )}
          </select>
        </div>
         <div className={estilos.grupoFormDosColumnas}>
          <div className={estilos.grupoForm}>
            <label>Imagen del Anuncio</label>
            <button type="button" className={estilos.selector} onClick={() => setAssetModalOpen(true)}>
              {activoSeleccionado ? (
                <img src={activoSeleccionado.cloudinary_url} alt="Activo seleccionado" className={estilos.previewImagen} />
              ) : (
                <>
                  <LuImagePlus />
                  <span>Seleccionar Activo</span>
                </>
              )}
            </button>
          </div>
            <div className={estilos.grupoForm}>
            <label>Texto del Anuncio</label>
            <button type="button" className={estilos.selector} onClick={() => setCopyModalOpen(true)}>
              {copySeleccionado ? (
                <p className={estilos.previewTexto}>{copySeleccionado}</p>
              ) : (
                <>
                  <LuFileText />
                  <span>Seleccionar Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className={estilos.grupoForm}>
          <label htmlFor="urlDestino">URL de Destino</label>
          <input id="urlDestino" type="url" value={urlDestino} onChange={(e) => setUrlDestino(e.target.value)} placeholder="https://tu-pagina-de-destino.com" required />
        </div>
        <div className={estilos.acciones}>
          <button type="submit" className={estilos.botonGuardar}>
            Publicar Anuncio en Meta
          </button>
        </div>
      </form>

      <Modal 
        titulo="Seleccionar Activo" // <<< CAMBIO 2: Título más genérico
        estaAbierto={assetModalOpen}
        alCerrar={() => setAssetModalOpen(false)}
        size="large" 
      >
        {/* <<< CAMBIO 3: Pasamos las imágenes del moodboard al selector */}
        <SelectorDeActivos onSeleccionar={handleAssetSelect} moodboardImages={moodboardDelPlan} />
      </Modal>

      <Modal
        titulo="Seleccionar Texto del Planificador"
        estaAbierto={copyModalOpen}
        alCerrar={() => setCopyModalOpen(false)}
      >
        <SelectorDeCopys copys={copysDelPlan} onSeleccionar={handleCopySelect} />
      </Modal>
    </>
  );
}