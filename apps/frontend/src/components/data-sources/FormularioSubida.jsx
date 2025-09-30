//Ubicacion: DCO/apps/frontend/src/components/data-sources/FormularioSubida.jsx

'use client';
import { useState, useRef } from 'react';
import estilos from './FormularioSubida.module.scss';
import { usarCarga } from '@/contexto/ContextoCarga';
import { usarAuth } from '@/contexto/ContextoAuth';
import { crearFuenteDeDatos } from '@/lib/api';
import Papa from 'papaparse'; // Importamos la librería

export default function FormularioSubida({ onSubidaExitosa }) {
  const [nombre, setNombre] = useState('');
  const archivoInputRef = useRef(null);
  const { setEstaCargando } = usarCarga();
  const { token } = usarAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const archivo = archivoInputRef.current.files[0];
    if (!archivo || !nombre) {
      alert('Por favor, selecciona un archivo y dale un nombre.');
      return;
    }

    setEstaCargando(true);

    // Papa Parse lee el archivo
    Papa.parse(archivo, {
      header: true, // Le decimos que la primera fila son los encabezados
      complete: async (results) => {
        try {
          // results.data contiene el JSON que necesitamos
          await crearFuenteDeDatos({ name: nombre, data: results.data }, token);
          onSubidaExitosa(); // Avisamos que todo salió bien
        } catch (error) {
          console.error(error);
          alert('Error al guardar la fuente de datos.');
        } finally {
          setEstaCargando(false);
        }
      },
      error: (error) => {
        console.error('Error al parsear el archivo:', error);
        alert('El archivo CSV no es válido.');
        setEstaCargando(false);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={estilos.formulario}>
      <div className={estilos.grupoForm}>
        <label htmlFor="nombre">Nombre de la Fuente de Datos</label>
        <input type="text" id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>
      <div className={estilos.grupoForm}>
        <label htmlFor="archivo">Archivo CSV</label>
        <input type="file" id="archivo" ref={archivoInputRef} accept=".csv" required />
      </div>
      <div className={estilos.acciones}>
        <button type="submit" className={estilos.botonGuardar}>Guardar</button>
      </div>
    </form>
  );
}