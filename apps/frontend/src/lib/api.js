// Ubicación: DCO/apps/frontend/src/lib/api.js

// Para el desarrollo local, el frontend y el backend corren en localhost.
const API_URL = 'http://localhost:8080/api/v1';

/**
 * Función auxiliar para realizar peticiones fetch, añadiendo el token de autenticación.
 * @param {string} endpoint El endpoint al que llamar (ej. '/campaigns')
 * @param {object} options Opciones para fetch (method, body, etc.)
 * @param {string} token El token de autenticación JWT
 * @returns {Promise<any>} La respuesta de la API en formato JSON
 */
const fetchConAuth = async (endpoint, options = {}, token) => {
  const headers = {
    ...options.headers,
  };

  // Si se proporciona un token, lo añadimos a la cabecera de autorización
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Si el cuerpo no es FormData y no se ha especificado Content-Type, asumimos JSON
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  const respuesta = await fetch(`${API_URL}${endpoint}`, config);

  if (!respuesta.ok) {
    // Intenta obtener información de error del cuerpo de la respuesta
    const errorInfo = await respuesta.json().catch(() => ({ message: respuesta.statusText }));
    throw new Error(errorInfo.message || 'Ocurrió un error en la petición al API');
  }

  // Si la respuesta no tiene contenido (ej. en un DELETE exitoso), no intentes parsear JSON
  if (respuesta.status === 204) {
    return null;
  }

  return respuesta.json();
};

// --- AUTH ---
export const loginUsuario = (email, password) => {
  // El login no usa fetchConAuth porque aún no hay token
  return fetchConAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
};

// --- DASHBOARD ---
export const obtenerMetricasDashboard = (token) => fetchConAuth('/dashboard/metrics', {}, token);
export const obtenerDatosDeRendimiento = (token) => fetchConAuth('/dashboard/performance', {}, token);

// --- CAMPAIGNS ---
export const obtenerCampañas = (token, page = 1, limit = 1000, searchTerm = '') => {
  // Usamos encodeURIComponent para asegurar que caracteres especiales se envíen correctamente
  const searchQuery = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
  return fetchConAuth(`/campaigns?page=${page}&limit=${limit}${searchQuery}`, {}, token);
};
export const crearCampaña = (campaignData, token) => fetchConAuth('/campaigns', { method: 'POST', body: JSON.stringify(campaignData) }, token);
export const actualizarCampaña = (id, campaignData, token) => fetchConAuth(`/campaigns/${id}`, { method: 'PUT', body: JSON.stringify(campaignData) }, token);
export const eliminarCampaña = (id, token) => fetchConAuth(`/campaigns/${id}`, { method: 'DELETE' }, token);
export const getCampaignById = (id, token) => fetchConAuth(`/campaigns/${id}`, {}, token);


// --- CREATIVES ---
export const obtenerCreatividades = (token, page = 1, searchTerm = '') => {
  const searchQuery = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
  return fetchConAuth(`/creatives?page=${page}&limit=8${searchQuery}`, {}, token);
};
export const crearCreatividad = (creativeData, token) => fetchConAuth('/creatives', { method: 'POST', body: JSON.stringify(creativeData) }, token);
export const actualizarCreatividad = (id, data, token) => fetchConAuth(`/creatives/${id}`, { method: 'PUT', body: JSON.stringify(data) }, token);
export const eliminarCreatividad = (id, token) => fetchConAuth(`/creatives/${id}`, { method: 'DELETE' }, token);
export const getCreativeById = (id, token) => fetchConAuth(`/creatives/${id}`, {}, token);


// --- TEMPLATES ---
export const obtenerPlantillas = (token) => fetchConAuth('/templates', {}, token);
export const guardarPlantilla = (templateData, token) => fetchConAuth('/templates', { method: 'POST', body: JSON.stringify(templateData) }, token);
export const eliminarPlantilla = (id, token) => fetchConAuth(`/templates/${id}`, { method: 'DELETE' }, token);


// --- DATA SOURCES ---
export const obtenerFuentesDeDatos = (token) => fetchConAuth('/data-sources', {}, token);
export const crearFuenteDeDatos = (dataSourceData, token) => fetchConAuth('/data-sources', { method: 'POST', body: JSON.stringify(dataSourceData) }, token);

// --- ASSETS & UPLOADS ---
export const obtenerActivos = (token) => fetchConAuth('/assets', {}, token);
export const subirActivo = (formData, token) => fetchConAuth('/upload', { method: 'POST', body: formData }, token);

// --- GENERATOR ---
export const generarCreatividad = (data, token) => fetchConAuth('/generator', { method: 'POST', body: JSON.stringify(data) }, token);

// --- CLIENTS ---
export const obtenerClientes = (token, page = 1, limit = 8) => fetchConAuth(`/clients?page=${page}&limit=${limit}`, {}, token);
export const crearCliente = (clientData, token) => fetchConAuth('/clients', { method: 'POST', body: JSON.stringify(clientData) }, token);
export const actualizarCliente = (id, clientData, token) => fetchConAuth(`/clients/${id}`, { method: 'PUT', body: JSON.stringify(clientData) }, token);
export const eliminarCliente = (id, token) => fetchConAuth(`/clients/${id}`, { method: 'DELETE' }, token);

// --- USUARIOS ---
export const obtenerUsuarios = (token, page = 1, searchTerm = '') => {
  const searchQuery = searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : '';
  return fetchConAuth(`/users?page=${page}&limit=8${searchQuery}`, {}, token);
};
export const crearUsuario = (userData, token) => fetchConAuth('/users', { method: 'POST', body: JSON.stringify(userData) }, token);
export const actualizarUsuario = (id, userData, token) => fetchConAuth(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }, token);
export const eliminarUsuario = (id, token) => fetchConAuth(`/users/${id}`, { method: 'DELETE' }, token);


// --- API CREDENTIALS ---
export const obtenerCredencialesCliente = (clientId, token) => fetchConAuth(`/credentials/client/${clientId}`, {}, token);
export const crearCredencial = (data, token) => fetchConAuth('/credentials', { method: 'POST', body: JSON.stringify(data) }, token);
export const eliminarCredencial = (id, token) => fetchConAuth(`/credentials/${id}`, { method: 'DELETE' }, token);

// --- META CREDENTIALS ---
export const obtenerCuentasPublicitarias = (clientId, token) => fetchConAuth(`/meta/ad-accounts/${clientId}`, {}, token);
export const obtenerCampañasDeMeta = (clientId, adAccountId, token) => fetchConAuth(`/meta/clients/${clientId}/ad-accounts/${adAccountId}/campaigns`, {}, token);
export const obtenerPaginasDeFacebook = (clientId, token) => fetchConAuth(`/meta/clients/${clientId}/pages`, {}, token);
export const crearCampañaEnMeta = (clientId, adAccountId, campaignData, token) => fetchConAuth(`/meta/clients/${clientId}/ad-accounts/${adAccountId}/campaigns`, { method: 'POST', body: JSON.stringify(campaignData) }, token);
export const eliminarCampañaDeMeta = (clientId, campaignId, token) => fetchConAuth(`/meta/clients/${clientId}/campaigns/${campaignId}`, { method: 'DELETE' }, token);
export const obtenerConjuntosDeAnuncios = (clientId, campaignId, token) => fetchConAuth(`/meta/clients/${clientId}/campaigns/${campaignId}/adsets`, {}, token);
export const createAdSetInMeta = (clientId, adAccountId, adSetData, token) => fetchConAuth(`/meta/clients/${clientId}/ad-accounts/${adAccountId}/adsets`, { method: 'POST', body: JSON.stringify(adSetData) }, token);
export const eliminarConjuntoDeAnuncios = (clientId, adSetId, token) => fetchConAuth(`/meta/clients/${clientId}/adsets/${adSetId}`, { method: 'DELETE' }, token);

// --- CONTENT PLANS ---
export const obtenerPlanesDeContenido = (clientId, token) => fetchConAuth(`/content-plans/client/${clientId}`, {}, token);
export const crearPlanDeContenido = (planData, token) => fetchConAuth('/content-plans', { method: 'POST', body: JSON.stringify(planData) }, token);
export const obtenerPlanDeContenidoPorId = (planId, token) => fetchConAuth(`/content-plans/${planId}`, {}, token);
export const actualizarPlanDeContenido = (planId, planData, token) => fetchConAuth(`/content-plans/${planId}`, { method: 'PUT', body: JSON.stringify(planData) }, token);
export const eliminarPlanDeContenido = (planId, token) => fetchConAuth(`/content-plans/${planId}`, { method: 'DELETE' }, token); 
export const generarCopysParaPlan = (planId, promptData, token) => fetchConAuth(`/content-plans/${planId}/generate-copies`, { method: 'POST', body: JSON.stringify(promptData) }, token);
export const generarImagenParaPlan = (planId, promptData, token) => fetchConAuth(`/content-plans/${planId}/generate-image`, { method: 'POST', body: JSON.stringify(promptData) }, token);
export const actualizarEstadoDelPlan = (planId, status, token) => fetchConAuth(`/content-plans/${planId}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }, token);
export const obtenerPlanParaAprobacion = (approvalToken) => {
  // Usamos 'fetch' directamente porque es una ruta pública
  return fetch(`${API_URL}/content-plans/approve/${approvalToken}`)
    .then(res => {
      if (!res.ok) throw new Error('Enlace de aprobación no válido o expirado.');
      return res.json();
    });
};
export const enviarDecisionDeAprobacion = (approvalToken, status, feedback = '') => {
  return fetch(`${API_URL}/content-plans/approve/${approvalToken}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, feedback }), // Añadimos el feedback al cuerpo
  }).then(res => {
    if (!res.ok) throw new Error('No se pudo procesar la decisión.');
    return res.json();
  });
};
export const iniciarProduccionMeta = (planId, adAccountId, token) => fetchConAuth(`/content-plans/${planId}/create-meta-campaign`, { method: 'POST', body: JSON.stringify({ adAccountId }) }, token);
export const obtenerPlanPorCampaignId = (metaCampaignId, token) => fetchConAuth(`/content-plans/by-campaign/${metaCampaignId}`, {}, token);

// --- PERFORMANCE REPORTS ---
export const obtenerReporteRendimiento = (filters = {}, token) => {
  // Filtramos para solo incluir parámetros que tengan un valor.
  const cleanFilters = Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => value)
  );

  console.log('Filtros enviados al backend:', cleanFilters); // LOG DE DEPURACIÓN

  const queryParams = new URLSearchParams(cleanFilters).toString();
  const endpoint = `/performance/report${queryParams ? `?${queryParams}` : ''}`;
  return fetchConAuth(endpoint, {}, token);
};


// --- Funciones para el flujo de creación en Meta ---
export const uploadImageToMeta = (clientId, adAccountId, imageUrl, token) => fetchConAuth(`/meta/clients/${clientId}/ad-accounts/${adAccountId}/images`, { method: 'POST', body: JSON.stringify({ imageUrl }) }, token);
export const createAdCreativeInMeta = (clientId, adAccountId, creativeData, token) => fetchConAuth(`/meta/clients/${clientId}/ad-accounts/${adAccountId}/creatives`, { method: 'POST', body: JSON.stringify(creativeData) }, token);
export const createAdInMeta = (clientId, adAccountId, adData, token) => fetchConAuth(`/meta/clients/${clientId}/ad-accounts/${adAccountId}/ads`, { method: 'POST', body: JSON.stringify(adData) }, token);


