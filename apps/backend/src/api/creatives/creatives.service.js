//Ubicacion: DCO/apps/backend/src/api/creatives/creatives.service.js

const db = require('../../services/pg.service');

const getAllCreatives = async (page = 1, limit = 8, searchTerm = '') => {
  const offset = (page - 1) * limit;

  let fromClause = `
    FROM creatives c
    JOIN campaigns camp ON c.campaign_id = camp.id
  `;
  let whereClause = '';

  const queryParams = [];
  let paramIndex = 1;

  if (searchTerm) {
    whereClause = ` WHERE c.name ILIKE $${paramIndex++}`;
    queryParams.push(`%${searchTerm}%`);
  }

  const countQueryString = `SELECT COUNT(c.id) ${fromClause}${whereClause}`;
  const countQuery = db.query(countQueryString, queryParams);

  const creativesQueryString = `SELECT c.id, c.name, c.created_at, c.updated_at, c.campaign_id, camp.name as campaign_name ${fromClause}${whereClause} ORDER BY c.updated_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
  
  const creativesQueryParams = [...queryParams, limit, offset];
  const creativesQuery = db.query(creativesQueryString, creativesQueryParams);
  
  const [creativesResult, countResult] = await Promise.all([creativesQuery, countQuery]);

  const totalCreatives = countResult.rows.length > 0 ? parseInt(countResult.rows[0].count, 10) : 0;

  return {
    creatives: creativesResult.rows,
    totalCreatives: totalCreatives,
  };
};

const createCreative = async (creativeData) => {
  const { name, campaign_id } = creativeData;
  const query = `
    INSERT INTO creatives (name, campaign_id)
    VALUES ($1, $2)
    RETURNING *;
  `;
  const values = [name, campaign_id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateCreative = async (id, creativeData) => {
  const { name, campaign_id } = creativeData;
  const query = `
    UPDATE creatives SET name = $1, campaign_id = $2, updated_at = current_timestamp
    WHERE id = $3 RETURNING *;
  `;
  const values = [name, campaign_id, id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteCreative = async (id) => {
  const query = 'DELETE FROM creatives WHERE id = $1 RETURNING *;';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const getCreativeById = async (id) => {
  const query = `
    SELECT creatives.*, campaigns.name as campaign_name 
    FROM creatives 
    JOIN campaigns ON creatives.campaign_id = campaigns.id 
    WHERE creatives.id = $1;
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllCreatives,
  createCreative,
  updateCreative,
  deleteCreative,
  getCreativeById,
};