//Ubicacion: DCO/apps/backend/src/api/campaigns/campaigns.service.js

const db = require('../../services/pg.service');

const getAllCampaigns = async (page = 1, limit = 8, searchTerm = '') => {
  const offset = (page - 1) * limit;
  
  let fromClause = 'FROM campaigns';
  let whereClause = '';

  // Parámetros para la consulta de conteo
  const countQueryParams = [];
  let countParamIndex = 1;

  // Parámetros para la consulta de campañas
  const campaignsQueryParams = [];
  let campaignsParamIndex = 1;

  // Si hay un término de búsqueda, lo añadimos a ambas listas de parámetros
  if (searchTerm) {
    whereClause = ` WHERE name ILIKE $${countParamIndex++}`; 
    countQueryParams.push(`%${searchTerm}%`);

    campaignsQueryParams.push(`%${searchTerm}%`);
    whereClause = ` WHERE name ILIKE $${campaignsParamIndex++}`; 
  }

  // --- Consulta para contar el total de filas ---
  const countQueryString = `SELECT COUNT(*) ${fromClause}${whereClause}`;
  const countQuery = db.query(countQueryString, countQueryParams);

  // --- Consulta para obtener las filas de la página actual ---
  // Añadimos la paginación a la consulta y a los parámetros de campañas
  campaignsQueryParams.push(limit, offset);
  const campaignsQueryString = `SELECT * ${fromClause}${whereClause} ORDER BY created_at DESC LIMIT $${campaignsParamIndex++} OFFSET $${campaignsParamIndex++}`;
  
  const campaignsQuery = db.query(campaignsQueryString, campaignsQueryParams);
  
  // Ejecutamos ambas consultas en paralelo
  const [campaignsResult, countResult] = await Promise.all([campaignsQuery, countQuery]);
  
  return {
    campaigns: campaignsResult.rows,
    totalCampaigns: parseInt(countResult.rows[0].count, 10),
  };
};

const getCampaignById = async (id) => {
  const result = await db.query('SELECT * FROM campaigns WHERE id = $1', [id]);
  return result.rows[0];
};

const createCampaign = async (campaignData) => {
  const { name, status, start_date, end_date } = campaignData;
  const query = `
    INSERT INTO campaigns (name, status, start_date, end_date)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [name, status, start_date, end_date];
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateCampaign = async (id, campaignData) => {
  const { name, status, start_date, end_date } = campaignData;
  const query = `
    UPDATE campaigns
    SET name = $1, status = $2, start_date = $3, end_date = $4, updated_at = current_timestamp
    WHERE id = $5
    RETURNING *;
  `;
  const values = [name, status, start_date, end_date, id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteCampaign = async (id) => {
  const query = 'DELETE FROM campaigns WHERE id = $1 RETURNING *;';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllCampaigns,
  getCampaignById,
  createCampaign,
  updateCampaign,
  deleteCampaign,
};