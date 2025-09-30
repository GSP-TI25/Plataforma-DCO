// Ubicacion: DCO/apps/backend/src/api/content-plans/plans.service.js

const db = require('../../services/pg.service');
const crypto = require('crypto'); // Módulo de Node.js para generar tokens seguros

const getPlansByClientId = async (clientId) => {
  const query = `
    SELECT cp.*, c.name as client_name 
    FROM content_plans cp
    JOIN clients c ON cp.client_id = c.id
    WHERE cp.client_id = $1 
    ORDER BY cp.created_at DESC
  `;
  const result = await db.query(query, [clientId]);
  return result.rows;
};

const createPlan = async (planData) => {
  const { name, client_id, objective } = planData;
  
  // Generamos un token seguro y único para el portal de aprobación
  const approvalToken = crypto.randomBytes(20).toString('hex');

  const query = `
    INSERT INTO content_plans (name, client_id, objective, approval_token)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const values = [name, client_id, objective, approvalToken];
  const result = await db.query(query, values);
  return result.rows[0];
};

const getPlanById = async (id) => {
  const query = 'SELECT * FROM content_plans WHERE id = $1';
  const result = await db.query(query, [id]);
  return result.rows[0]; // Devuelve el primer resultado o undefined si no lo encuentra
};

const updatePlan = async (id, planData) => {
  const fields = Object.keys(planData);
  const setClause = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
  
  // Antes de crear la lista de valores, revisamos si alguno de ellos necesita ser
  // convertido a un string de JSON.
  const values = Object.values(planData).map(value => {
    // Si el valor es un objeto o un array (como nuestro moodboard), lo convertimos.
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }
    // Si no, lo dejamos como está.
    return value;
  });
  
  const query = `
    UPDATE content_plans 
    SET ${setClause}, updated_at = current_timestamp
    WHERE id = $${fields.length + 1} RETURNING *;
  `;
  
  const result = await db.query(query, [...values, id]);
  return result.rows[0];
};

const deletePlan = async (id) => {
  const query = 'DELETE FROM content_plans WHERE id = $1 RETURNING *;';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const updatePlanStatus = async (id, status) => {
  const query = `
    UPDATE content_plans 
    SET status = $1, updated_at = current_timestamp
    WHERE id = $2 RETURNING *;
  `;
  const result = await db.query(query, [status, id]);
  return result.rows[0];
};

const getPlanByApprovalToken = async (token) => {
  const query = `
    SELECT cp.*, c.name as client_name
    FROM content_plans cp
    JOIN clients c ON cp.client_id = c.id
    WHERE cp.approval_token = $1;
  `;
  const result = await db.query(query, [token]);
  return result.rows[0];
};

const updatePlanStatusByToken = async (token, newStatus, feedback) => {
  const query = `
    UPDATE content_plans
    SET status = $1, client_feedback = $2, updated_at = current_timestamp
    WHERE approval_token = $3 RETURNING *;
  `;
  // Si el estado es 'approved', el feedback será null.
  const result = await db.query(query, [newStatus, feedback, token]);
  return result.rows[0];
};

const getPlanByMetaCampaignId = async (metaCampaignId) => {
  const query = `
    SELECT * FROM content_plans WHERE meta_campaign_id = $1;
  `;
  const result = await db.query(query, [metaCampaignId]);
  return result.rows[0];
};

module.exports = {
  getPlansByClientId,
  createPlan,
  getPlanById,
  updatePlan, 
  deletePlan,
  updatePlanStatus,
  getPlanByApprovalToken,
  updatePlanStatusByToken,
  getPlanByMetaCampaignId,
};
