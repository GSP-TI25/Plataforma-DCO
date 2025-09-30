// Ubicación: DCO/apps/backend/src/api/api-credentials/credentials.service.js
const db = require('../../services/pg.service');

// Obtiene todas las credenciales para un cliente específico
const getCredentialsByClientId = async (clientId) => {
  const query = 'SELECT * FROM api_credentials WHERE client_id = $1 ORDER BY platform';
  const result = await db.query(query, [clientId]);
  return result.rows;
};

// Crea una nueva credencial
const createCredential = async (credentialData) => {
  const { client_id, platform, access_token } = credentialData;
  // En producción, aquí encriptaríamos el access_token antes de guardarlo.
  const query = `
    INSERT INTO api_credentials (client_id, platform, access_token)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [client_id, platform, access_token];
  const result = await db.query(query, values);
  return result.rows[0];
};

// Elimina una credencial
const deleteCredential = async (id) => {
  const query = 'DELETE FROM api_credentials WHERE id = $1 RETURNING *;';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

const getClientAccessToken = async (clientId, platform) => {
  const query = 'SELECT access_token FROM api_credentials WHERE client_id = $1 AND platform = $2';
  const result = await db.query(query, [clientId, platform]);
  if (result.rows.length === 0) {
    throw new Error(`Token de ${platform} no encontrado para este cliente.`);
  }
  return result.rows[0].access_token;
};

module.exports = {
  getCredentialsByClientId,
  createCredential,
  deleteCredential,
  getClientAccessToken,
};