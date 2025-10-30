// Ubicación: DCO/apps/frontend/src/app/dashboard/reports/page.jsx
'use client';
import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, PieChart, Pie, Cell, Legend, Tooltip, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { obtenerReporteRendimiento, obtenerClientes, obtenerPlanesDeContenido } from '@/lib/api';
import { usarAuth } from '@/contexto/ContextoAuth';
import styles from './ReportsPage.module.scss';
import { LuCalendar, LuFilter, LuDownload, LuUsers, LuClipboardList, LuSearch, LuFilterX } from 'react-icons/lu';
import GraficoDeRendimiento from '@/components/dashboard/GraficoDeRendimiento';
import Paginacion from '@/components/ui/Paginacion/Paginacion';

// Componente Placeholder mientras cargan los datos o no hay datos
const Placeholder = ({ message }) => (
  <div className={styles.placeholder}>{message}</div>
);

const PLATFORM_COLORS = {
  meta: '#1877F2', 
  google: '#4285F4',
  tiktok: '#000000', 
};

export default function ReportsPage() {
  const [filters, setFilters] = useState({
    startDate: '', 
    endDate: '',
    platform: '',
    clientId: '',  
    campaignId: '',   
  });
  const [activeFilters, setActiveFilters] = useState(filters);
  const [paginaActual, setPaginaActual] = useState(1);
  const { token } = usarAuth();

  const { data: clientsData, isLoading: isLoadingClients } = useQuery({
    queryKey: ['clientsListForFilter'], 
    queryFn: () => obtenerClientes(token, 1, 1000), 
    enabled: !!token,
    staleTime: 5 * 60 * 1000, 
    refetchOnWindowFocus: false, 
    retry: 1, 
  });
  const clients = clientsData?.clients || [];

  const { data: campaignsData, isLoading: isLoadingCampaigns } = useQuery({
    queryKey: ['campaignsListForFilter', filters.clientId], 
    queryFn: () => obtenerPlanesDeContenido(filters.clientId, token),
    enabled: !!token && !!filters.clientId, 
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const campaigns = campaignsData || [];

  // --- Carga de datos del reporte (Ahora depende de 'activeFilters' y 'paginaActual') ---
  const { data, isLoading, isError, error } = useQuery({ 
    queryKey: ['performanceReport', activeFilters, paginaActual], // <<< 3. Añadimos 'paginaActual'
    // <<< 4. CORREGIMOS EL TYPO (Rendimiento con 'i') y añadimos 'page' y 'limit' >>>
    queryFn: () => obtenerReporteRendimiento({ ...activeFilters, page: paginaActual, limit: 10 }, token), 
    enabled: !!token, 
    staleTime: 1000,
  });

  const reportData = data?.reportData || [];
  const totalPaginas = data?.totalPages || 1;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      if (name === 'clientId') {
        newFilters.campaignId = ''; 
      }
      return newFilters;
    });
  };

 const handleApplyFilters = () => {
    setActiveFilters(filters); 
    setPaginaActual(1); 
  };

  const handleClearFilters = () => {
    const cleared = { startDate: '', endDate: '', platform: '', clientId: '', campaignId: '' };
    setFilters(cleared);
    setActiveFilters(cleared);
    setPaginaActual(1); // <<< 7. Al limpiar filtros, volvemos a la página 1
  };

  const calculateSummary = (data) => {
    if (!data || data.length === 0) return { totalSpend: 0, totalClicks: 0, totalImpressions: 0 };
    return data.reduce((acc, row) => {
      acc.totalSpend += parseFloat(row.spend || 0);
      acc.totalClicks += parseInt(row.clicks || 0, 10);
      acc.totalImpressions += parseInt(row.impressions || 0, 10);
      return acc;
    }, { totalSpend: 0, totalClicks: 0, totalImpressions: 0 });
  };

  const { 
    chartDataTimeline, 
    chartDataSpendByPlatform, 
    chartDataImpressionsByPlatform,
    chartDataConversionsByPlatform // <<< 1. Añadimos nuevo set de datos
  } = useMemo(() => {
    if (!reportData || reportData.length === 0) {
      return { chartDataTimeline: [], chartDataSpendByPlatform: [], chartDataImpressionsByPlatform: [], chartDataConversionsByPlatform: [] };
    }

    // 1. Datos para el gráfico de líneas (tendencias)
    const groupedByDate = reportData.reduce((acc, row) => {
      const date = new Date(row.report_date).toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' });
      if (!acc[date]) {
        acc[date] = { name: date, dateObj: new Date(row.report_date), Impresiones: 0, Clics: 0, Gasto: 0.0 };
      }
      acc[date].Impresiones += parseInt(row.impressions || 0, 10);
      acc[date].Clics += parseInt(row.clicks || 0, 10);
      acc[date].Gasto += parseFloat(row.spend || 0.00);
      return acc;
    }, {});
    const chartDataTimeline = Object.values(groupedByDate).sort((a, b) => a.dateObj - b.dateObj);

    // 2. Datos para el gráfico de barras (gasto por plataforma)
    const spendByPlatform = reportData.reduce((acc, row) => {
      const platform = row.platform || 'unknown';
      if (!acc[platform]) {
        acc[platform] = { name: platform, Gasto: 0.0 };
      }
      acc[platform].Gasto += parseFloat(row.spend || 0.00);
      return acc;
    }, {});
    const chartDataSpendByPlatform = Object.values(spendByPlatform);

    // 3. Datos para el gráfico circular (impresiones por plataforma)
    const impressionsByPlatform = reportData.reduce((acc, row) => {
        const platform = row.platform || 'unknown';
        if (!acc[platform]) {
            acc[platform] = { name: platform, Impresiones: 0 };
        }
        acc[platform].Impresiones += parseInt(row.impressions || 0, 10);
        return acc;
      }, {});
    const chartDataImpressionsByPlatform = Object.values(impressionsByPlatform);

    // <<< 2. NUEVO: Datos para el gráfico de Conversiones por Plataforma >>>
    const conversionsByPlatform = reportData.reduce((acc, row) => {
      const platform = row.platform || 'unknown';
      if (!acc[platform]) {
        acc[platform] = { name: platform, Conversiones: 0 };
      }
      acc[platform].Conversiones += parseInt(row.conversions || 0, 10);
      return acc;
    }, {});
    const chartDataConversionsByPlatform = Object.values(conversionsByPlatform);


    return { chartDataTimeline, chartDataSpendByPlatform, chartDataImpressionsByPlatform, chartDataConversionsByPlatform };

  }, [reportData]);

  const summary = calculateSummary(reportData);
  const ctr = summary.totalImpressions > 0 ? ((summary.totalClicks / summary.totalImpressions) * 100).toFixed(2) + '%' : 'N/A';
  
  return (
    <div className={styles.reportsContainer}>
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id="chart-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#000000" floodOpacity="0.1" />
          </filter>
        </defs>
      </svg>
      <header className={styles.header}>
        <h1>Reportes de Rendimiento</h1>
        <button className={styles.downloadButton}>
          <LuDownload /> Exportar
        </button>
      </header>

      <div className={styles.filterBar}>
        <div className={styles.filterGroup}>
          <LuFilter />
          <label htmlFor="platform">Plataforma:</label>
          <select id="platform" name="platform" value={filters.platform || ''} onChange={handleFilterChange}>
            <option value="">Todas</option>
            <option value="meta">Meta</option>
            <option value="google">Google</option>
            <option value="tiktok">TikTok</option>
          </select>
        </div>
        <div className={styles.filterGroup}>
          <LuCalendar />
          <label htmlFor="startDate">Desde:</label>
          <input type="date" id="startDate" name="startDate" value={filters.startDate || ''} onChange={handleFilterChange} />
          <label htmlFor="endDate">Hasta:</label>
          <input type="date" id="endDate" name="endDate" value={filters.endDate || ''} onChange={handleFilterChange} />
        </div>
        <div className={styles.filterGroup}>
          <LuUsers />
          <label htmlFor="clientId">Cliente:</label>
          <select 
            id="clientId" 
            name="clientId" 
            value={filters.clientId} 
            onChange={handleFilterChange}
            disabled={isLoadingClients} 
          >
            <option value="">{isLoadingClients ? 'Cargando...' : 'Todos'}</option> 
            {clients.map(client => (
              <option key={client.id} value={client.id}>{client.name}</option>
            ))}
          </select>
        </div>
        {filters.clientId && (
          <div className={styles.filterGroup}>
            <LuClipboardList />
            <label htmlFor="campaignId">Campaña (Plan):</label>
            <select 
              id="campaignId" 
              name="campaignId" 
              value={filters.campaignId} 
              onChange={handleFilterChange}
              disabled={isLoadingCampaigns || !campaigns || campaigns.length === 0} 
            >
              <option value="">{isLoadingCampaigns ? 'Cargando...' : 'Todas'}</option>
              {campaigns.map(plan => (
                <option key={plan.id} value={plan.id}>{plan.name}</option>
              ))}
            </select>
          </div>
        )}
        <div className={styles.filterActions}>
          <button className={styles.applyButton} onClick={handleApplyFilters}>
            <LuSearch /> Aplicar Filtros
          </button>
          <button className={styles.clearButton} onClick={handleClearFilters}>
            <LuFilterX /> Limpiar
          </button>
        </div>
      </div>

      <div className={styles.summarySection}>
        <div className={styles.summaryCard}>
          <h4>Gasto Total</h4>
          <p>S/ {summary.totalSpend.toFixed(2)}</p> 
        </div>
        <div className={styles.summaryCard}>
          <h4>Impresiones</h4>
          <p>{summary.totalImpressions.toLocaleString('es-PE')}</p>
        </div>
        <div className={styles.summaryCard}>
          <h4>Clics</h4>
          <p>{summary.totalClicks.toLocaleString('es-PE')}</p>
        </div>
        <div className={styles.summaryCard}>
          <h4>CTR</h4>
          <p>{ctr}</p>
        </div>
      </div>

      <div className={styles.chartSection}>
        <h2>Tendencias Generales</h2>
        {isLoading && <Placeholder message="Cargando gráfico..." />}
        {isError && <Placeholder message="Error al cargar datos para el gráfico." />}
        {!isLoading && !isError && chartDataTimeline.length > 0 && (
          <GraficoDeRendimiento data={chartDataTimeline} line1Key="Impresiones" line2Key="Clics" /> 
        )}
        {!isLoading && !isError && chartDataTimeline.length === 0 && (
          <Placeholder message="No hay suficientes datos para mostrar tendencias." />
        )}
      </div>

      <div className={styles.chartGrid}> 

        <div className={styles.chartCard}>
          <h2>Gasto por Plataforma</h2>
          {isLoading && <Placeholder message="Cargando gráfico..." />}
          {isError && <Placeholder message="Error al cargar datos." />}
          {!isLoading && !isError && chartDataSpendByPlatform.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataSpendByPlatform} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280"/>
                <Tooltip formatter={(value) => `S/ ${value.toFixed(2)}`}/>
                <Bar dataKey="Gasto" name="Gasto Total" filter="url(#chart-shadow)">
                  {chartDataSpendByPlatform.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.name.toLowerCase()] || '#8884d8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {!isLoading && !isError && chartDataSpendByPlatform.length === 0 && (
            <Placeholder message="No hay datos de gasto." />
          )}
        </div>

        <div className={styles.chartCard}>
          <h2>Conversiones por Plataforma</h2>
          {isLoading && <Placeholder message="Cargando gráfico..." />}
          {isError && <Placeholder message="Error al cargar datos." />}
          {!isLoading && !isError && chartDataConversionsByPlatform.length > 0 && (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataConversionsByPlatform} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280"/>
                <Tooltip formatter={(value) => value.toLocaleString('es-PE')}/>
                <Bar dataKey="Conversiones" name="Conversiones Totales" filter="url(#chart-shadow)">
                  {chartDataConversionsByPlatform.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.name.toLowerCase()] || '#8884d8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
          {/* <<< Lógica de placeholder para CERO conversiones >>> */}
          {!isLoading && !isError && chartDataConversionsByPlatform.length > 0 && summary.totalConversions === 0 && (
            <Placeholder message="No hay datos de conversiones." />
          )}
        </div>

        <div className={styles.chartCard}>
           <h2>Distribución de Impresiones</h2>
           {isLoading && <Placeholder message="Cargando gráfico..." />}
           {isError && <Placeholder message="Error al cargar datos." />}
           {!isLoading && !isError && chartDataImpressionsByPlatform.length > 0 && (
             <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartDataImpressionsByPlatform}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="Impresiones"
                    stroke="#fff"
                    nameKey="name"
                    filter="url(#chart-shadow)"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {chartDataImpressionsByPlatform.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PLATFORM_COLORS[entry.name] || '#8884d8'} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => value.toLocaleString('es-PE')}/>
                  <Legend />
                </PieChart>
             </ResponsiveContainer>
           )}
           {!isLoading && !isError && chartDataImpressionsByPlatform.length === 0 && (
             <Placeholder message="No hay datos de impresiones." />
           )}
        </div>
      </div>


      <div className={styles.dataTableSection}>
        <h2>Datos Detallados</h2>
        {isLoading && <Placeholder message="Cargando datos..." />}
        {isError && <Placeholder message={`Error al cargar datos: ${error.message}`} />} 
        {!isLoading && !isError && (!reportData || reportData.length === 0) && (
          <Placeholder message="No se encontraron datos para los filtros seleccionados." />
        )}
        {!isLoading && !isError && reportData && reportData.length > 0 && (
          <>
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Plataforma</th>
                    <th>ID Anuncio</th>
                    <th>Impresiones</th>
                    <th>Clics</th>
                    <th>Gasto (S/)</th>
                    <th>Conversiones</th>
                    {/*<th>CTR</th>*/}
                    {/*<th>CPC</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row) => (
                    <tr key={row.id}>
                      <td>{new Date(row.report_date).toLocaleDateString('es-PE')}</td>
                      <td><span className={`${styles.platformBadge} ${styles[row.platform]}`}>{row.platform}</span></td>
                      <td>{row.ad_id_platform}</td>
                      <td>{row.impressions.toLocaleString('es-PE')}</td>
                      <td>{row.clicks.toLocaleString('es-PE')}</td>
                      <td>{parseFloat(row.spend).toFixed(2)}</td>
                      <td>{row.conversions !== null ? row.conversions : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              enCambioDePagina={setPaginaActual} 
            />
        </>
        )}
      </div>
    </div>
  );
}