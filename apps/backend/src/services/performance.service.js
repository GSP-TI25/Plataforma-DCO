// Ubicación: DCO/apps/backend/src/services/performance.service.js

const axios = require('axios');
const db = require('./pg.service');
const facebookService = require('./facebook.service');
const credentialsService = require('../api/api-credentials/credentials.service');

/**
 * Función auxiliar para obtener la fecha en formato YYYY-MM-DD.
 */
const getFormattedDate = (day = 'yesterday') => {
  const date = new Date();
  if (day === 'yesterday') {
    date.setDate(date.getDate() - 1);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dayOfMonth = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dayOfMonth}`;
};

/**
 * Obtiene las métricas de rendimiento de los anuncios de Meta.
 */
const getMetaAdInsights = async (accessToken, adAccountId, dateKeyword = 'yesterday') => {
  const url = `https://graph.facebook.com/v19.0/${adAccountId}/insights`;
  const formattedDate = getFormattedDate(dateKeyword);

  const params = {
    access_token: accessToken,
    level: 'ad',
    fields: 'ad_id,impressions,clicks,spend,actions', // <<< 'ad_id' es clave
    time_range: JSON.stringify({ since: formattedDate, until: formattedDate }),
    limit: 500
  };

  try {
    console.log(`Requesting insights for ${adAccountId} on ${formattedDate}`);
    const response = await axios.get(url, { params });
    console.log(`Received ${response.data?.data?.length || 0} insights for ${adAccountId}`);
    return response.data?.data || [];
  } catch (error) {
    console.error(`Error fetching insights for account ${adAccountId} on ${formattedDate}:`);
    if (error.response?.data?.error) {
      console.error('Meta API Error:', JSON.stringify(error.response.data.error, null, 2));
    } else {
      console.error('Network/Request Error:', error.message);
    }
    return [];
  }
};

/**
 * <<< CORREGIDA >>>
 * Guarda o actualiza los datos de rendimiento en la base de datos.
 * Ahora maneja 'ad_id' (de Meta) y 'ad_id_platform' (de datos de prueba).
 */
const savePerformanceData = async (insightsData) => {
  if (!insightsData || insightsData.length === 0) {
    console.log('No insights data to save.');
    return;
  }

  const query = `
    INSERT INTO ad_performance (
      ad_id_platform, platform, report_date, 
      impressions, clicks, spend, 
      conversions, reactions,
      client_id, campaign_id 
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (ad_id_platform, platform, report_date, client_id, campaign_id) 
    DO UPDATE SET 
      impressions = EXCLUDED.impressions, 
      clicks = EXCLUDED.clicks, 
      spend = EXCLUDED.spend, 
      conversions = EXCLUDED.conversions, 
      reactions = EXCLUDED.reactions;
  `;

  let savedCount = 0;
  for (const insight of insightsData) {
    const adIdPlatformValue = insight.ad_id_platform || insight.ad_id;

    if (!adIdPlatformValue) {
      console.error('Error: Missing ad_id_platform or ad_id in insight data:', insight);
      continue; 
    }

    const reportDate = insight.report_date || insight.date_start || getFormattedDate('yesterday');
    
    // <<< ¡LA CORRECCIÓN ESTÁ AQUÍ! >>>
    // Primero, buscamos 'conversions' (de datos de prueba).
    // Si no existe, buscamos en 'actions' (de datos reales de Meta).
    const testDataConversions = insight.conversions;
    const metaDataConversions = insight.actions?.find(a => a.action_type === 'offsite_conversion')?.value;
    const conversions = testDataConversions !== undefined ? testDataConversions : (metaDataConversions || null);

    const testDataReactions = insight.reactions;
    const metaDataReactions = insight.actions?.find(a => a.action_type === 'post_reaction')?.value;
    const reactions = testDataReactions !== undefined ? testDataReactions : (metaDataReactions || null);
    
    const values = [
      adIdPlatformValue,
      insight.platform || 'meta',
      reportDate,
      parseInt(insight.impressions || 0, 10),
      parseInt(insight.clicks || 0, 10),
      parseFloat(insight.spend || 0.00),
      conversions ? parseInt(conversions, 10) : null,
      reactions ? parseInt(reactions, 10) : null,
      insight.client_id,   
      insight.campaign_id, 
    ];

    try {
      await db.query(query, values);
      savedCount++;
    } catch (dbError) {
      console.error(`Error saving performance data for ad ${adIdPlatformValue} on ${reportDate}:`, dbError.message);
      console.error('Failed values:', values); 
    }
  }
  console.log(`Attempted to save ${insightsData.length} records, successfully saved/updated ${savedCount}.`);
};
/**
 * Obtiene los datos de rendimiento guardados, con opciones de filtrado.
 */
const getPerformanceReport = async (filters = {}) => {
  // <<< NUEVA LÓGICA DE PAGINACIÓN >>>
  const page = parseInt(filters.page || 1, 10);
  const limit = parseInt(filters.limit || 10, 10); // 10 filas por defecto
  const offset = (page - 1) * limit;

  let baseQuery = `FROM ad_performance ap`;
  const values = [];
  let whereClause = [];
  let paramIndex = 1;

  // Construir la cláusula WHERE (igual que antes)
  if (filters.startDate) {
    whereClause.push(`ap.report_date >= $${paramIndex++}`);
    values.push(filters.startDate);
  }
  if (filters.endDate) {
    whereClause.push(`ap.report_date <= $${paramIndex++}`);
    values.push(filters.endDate);
  }
  if (filters.platform) {
    whereClause.push(`ap.platform = $${paramIndex++}`);
    values.push(filters.platform);
  }
  if (filters.clientId) {
    whereClause.push(`ap.client_id = $${paramIndex++}`);
    values.push(filters.clientId);
  }
  if (filters.campaignId) {
    whereClause.push(`ap.campaign_id = $${paramIndex++}`);
    values.push(filters.campaignId);
  }

  if (whereClause.length > 0) {
    baseQuery += ' WHERE ' + whereClause.join(' AND ');
  }

  // --- Consulta para Contar el Total de Filas (con filtros) ---
  const countQueryString = `SELECT COUNT(*) ${baseQuery}`;
  const countQuery = db.query(countQueryString, values);

  // --- Consulta para Obtener la Página Actual de Datos ---
  const dataQueryString = `SELECT ap.* ${baseQuery} ORDER BY ap.report_date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++};`;
  const dataQuery = db.query(dataQueryString, [...values, limit, offset]);

  try {
    console.log('--- Executing Performance Report Query ---');
    console.log('SQL (Count):', countQueryString);
    console.log('SQL (Data):', dataQueryString);
    console.log('Values:', values);
    
    // Ejecutamos ambas consultas en paralelo
    const [countResult, dataResult] = await Promise.all([countQuery, dataQuery]);

    const totalRows = parseInt(countResult.rows[0].count, 10);

    return {
      reportData: dataResult.rows,
      totalRows: totalRows,
      totalPages: Math.ceil(totalRows / limit)
    };

  } catch (error) {
    console.error("Error executing performance report query:", error.message);
    throw new Error("Could not fetch performance report from database."); 
  }
};

/**
 * Genera datos de prueba.
 */
const generateTestData = async () => {
  console.log('🌱 Iniciando generación de datos de prueba...');
  try {
    // 1. Obtener algunos IDs de clientes y planes existentes
    const plansResult = await db.query(
      'SELECT id, client_id, meta_campaign_id FROM content_plans WHERE meta_campaign_id IS NOT NULL LIMIT 10'
    );

    if (plansResult.rows.length === 0) {
      const msg = "No hay 'content_plans' con un 'meta_campaign_id' para generar datos de prueba realistas.";
      console.warn(`⚠️ ${msg}`);
      return { generated: 0, message: msg };
    }

    const plans = plansResult.rows;
    const testData = [];
    const platforms = ['meta', 'google', 'tiktok']; 
    const today = new Date();

    console.log(`Usando ${plans.length} planes/campañas para generar datos...`);

    // 2. Generamos datos para los últimos 7 días
    for (let i = 0; i < 7; i++) {
      const reportDate = new Date(today);
      reportDate.setDate(today.getDate() - i);
      const formattedDate = reportDate.toISOString().split('T')[0]; // YYYY-MM-DD

      // Por cada día, generamos datos para cada plan
      for (const planInfo of plans) {
        // Y por cada plan, generamos datos para cada plataforma
        for (const platform of platforms) {
          // Generamos datos para 2-5 anuncios ficticios por plataforma/plan/día
          const numAds = Math.floor(Math.random() * 4) + 2; 
          for (let adIdx = 0; adIdx < numAds; adIdx++) {
            // Usamos el meta_campaign_id como identificador base
            const adIdPlatform = `TEST_AD_${platform}_${planInfo.meta_campaign_id}_${adIdx + 1}`; 
            
            // Métricas aleatorias
            const impressions = Math.floor(Math.random() * 5000) + 1000;
            const clicks = Math.floor(impressions * (Math.random() * 0.05 + 0.01)); // CTR 1-6%
            const spend = parseFloat((impressions / 1000 * (Math.random() * 5 + 2)).toFixed(2)); // CPM $2-$7
            const conversions = Math.floor(clicks * (Math.random() * 0.1 + 0.02)); // Conv Rate 2-12%
            const reactions = platform === 'meta' ? Math.floor(impressions * (Math.random() * 0.01)) : null; // Solo Meta tiene reacciones

            testData.push({
              ad_id_platform: adIdPlatform,
              platform: platform,
              report_date: formattedDate,
              impressions: impressions,
              clicks: clicks,
              spend: spend,
              conversions: conversions,
              reactions: reactions,
              client_id: planInfo.client_id, // Usamos el client_id del plan
              campaign_id: planInfo.id      // Usamos el id (UUID) del plan
            });
          }
        }
      }
    }

    if (testData.length === 0) {
        console.log('🤷 No se generaron datos de prueba.');
        return { generated: 0, message: "No se pudo generar datos." };
    }
    
    // <<< LIMPIEZA: Borramos solo los datos de prueba ANTES de insertar los nuevos >>>
    console.log('🧹 Limpiando datos de prueba anteriores...');
    await db.query("DELETE FROM ad_performance WHERE ad_id_platform LIKE 'TEST_AD_%';");
    
    console.log(`💾 Intentando guardar ${testData.length} nuevos registros de prueba...`);
    // Usamos la función savePerformanceData que ya sabemos que funciona
    await savePerformanceData(testData); 

    console.log(`✅ ${testData.length} registros de datos de prueba generados y guardados.`);
    return { generated: testData.length, message: `${testData.length} registros de prueba generados.` };

  } catch (error) {
    console.error('❌ Error generando datos de prueba:', error.message);
    throw new Error('Error al generar datos de prueba.');
  }
};

/**
 * <<< ACTUALIZADA >>>
 * Función principal del worker: Obtiene y guarda los datos de rendimiento de Meta,
 * incluyendo ahora la búsqueda de client_id y campaign_id.
 */
const syncMetaPerformanceData = async () => {
  console.log('📈 Iniciando sincronización de rendimiento de Meta...');
  try {
    // --- Obtener Credenciales y Cuentas Publicitarias ---
    const credentialsResult = await db.query(`
      SELECT ac.client_id, ac.access_token
      FROM api_credentials ac
      JOIN clients c ON ac.client_id = c.id
      WHERE ac.platform = 'meta' AND c.is_active = true;
    `);
    
    let credentialsWithAccounts = [];
    if (credentialsResult.rows.length > 0) {
        console.log(`Found ${credentialsResult.rows.length} Meta credentials to process.`);
        for(const cred of credentialsResult.rows) {
            console.log(`--- Procesando Cliente ID: ${cred.client_id} ---`);
            try {
                const accounts = await facebookService.getAdAccounts(cred.access_token);
                if (accounts && accounts.length > 0) {
                    console.log(`   Found ${accounts.length} ad accounts for client ${cred.client_id}.`);
                    accounts.forEach(acc => {
                        const accountIdWithPrefix = acc.id.startsWith('act_') ? acc.id : `act_${acc.id}`;
                        credentialsWithAccounts.push({
                            client_id: cred.client_id, 
                            access_token: cred.access_token,
                            ad_account_id: accountIdWithPrefix,
                            account_name: acc.name
                        });
                    });
                } else {
                     console.log(`   No ad accounts found for client ${cred.client_id}.`);
                }
            } catch (accError) {
                 console.error(`   Error fetching ad accounts for client ${cred.client_id}:`, accError.message);
            }
        }
    } else {
        console.log('📉 No hay clientes activos con credenciales de Meta para sincronizar.');
        return;
    }
    
    if (credentialsWithAccounts.length === 0) {
      console.log('📉 No se encontraron cuentas publicitarias válidas para sincronizar.');
      return;
    }

    console.log(`Starting insights fetch for ${credentialsWithAccounts.length} account(s).`);

    // --- Iterar y Procesar Insights (CON NUEVA LÓGICA DE ENRIQUECIMIENTO) ---
    for (const cred of credentialsWithAccounts) {
      console.log(`🔍 Obteniendo datos para cuenta ${cred.ad_account_id} (${cred.account_name})...`);
      
      // 1. Obtenemos los insights (métrica + ad_id)
      const insightsRaw = await getMetaAdInsights(cred.access_token, cred.ad_account_id, 'yesterday');

      if (insightsRaw.length > 0) {
        console.log(`   📊 Received ${insightsRaw.length} raw insights. Enriching with local IDs...`);
        
        const insightsEnriched = [];
        const campaignIdCache = new Map(); 

        for (const insight of insightsRaw) {
          let localCampaignId = null;
          try {
            // 2. Por cada ad_id, preguntamos a Meta por su campaign_id
            const adInfoUrl = `https://graph.facebook.com/v19.0/${insight.ad_id}`;
            const adInfoParams = { access_token: cred.access_token, fields: 'campaign_id' };
            let metaCampaignId = null;
            try {
                const adInfoResponse = await axios.get(adInfoUrl, { params: adInfoParams });
                metaCampaignId = adInfoResponse.data?.campaign_id;
            } catch (adInfoError) {
                 console.warn(`   [Warn] No se pudo obtener el Meta Campaign ID para el Ad ID ${insight.ad_id}: ${adInfoError.response?.data?.error?.message || adInfoError.message}`);
            }

            // 3. Buscamos ese meta_campaign_id en nuestra BD
            if (metaCampaignId) {
              if (campaignIdCache.has(metaCampaignId)) {
                localCampaignId = campaignIdCache.get(metaCampaignId);
              } else {
                const planResult = await db.query(
                  'SELECT id FROM content_plans WHERE meta_campaign_id = $1 AND client_id = $2',
                  [metaCampaignId, cred.client_id]
                );
                if (planResult.rows.length > 0) {
                  localCampaignId = planResult.rows[0].id;
                  campaignIdCache.set(metaCampaignId, localCampaignId); 
                } else {
                  campaignIdCache.set(metaCampaignId, null);
                  console.warn(`   [Warn] Plan local no encontrado para Meta Campaign ID ${metaCampaignId} y Cliente ${cred.client_id}`);
                }
              }
            }
            
            // 4. Añadimos los IDs al objeto insight
            insightsEnriched.push({
              ...insight, // Esto incluye 'ad_id' que será usado por savePerformanceData
              client_id: cred.client_id,
              campaign_id: localCampaignId 
            });

          } catch (lookupError) {
            console.error(`   [Error] looking up local IDs for ad ${insight.ad_id}:`, lookupError.message);
            insightsEnriched.push({ ...insight, client_id: cred.client_id, campaign_id: null });
          }
        } // Fin del bucle for 'insight'

        // 5. Guardamos los datos enriquecidos
        if (insightsEnriched.length > 0) {
            console.log(`💾 Guardando ${insightsEnriched.length} registros de rendimiento enriquecidos para cuenta ${cred.ad_account_id}...`);
            await savePerformanceData(insightsEnriched); 
        }

      } else {
        console.log(`📊 No se encontraron datos de rendimiento para ayer en cuenta ${cred.ad_account_id}.`);
      }
    } // Fin del bucle for 'cred'

    console.log('✅ Sincronización de rendimiento de Meta completada.');

  } catch (error) {
    console.error('❌ Error general durante la sincronización de rendimiento:', error.message);
  }
};

module.exports = {
  syncMetaPerformanceData,
  getPerformanceReport,
  generateTestData,
  getFormattedDate, // Exportar por si acaso
  getMetaAdInsights,
  savePerformanceData
};