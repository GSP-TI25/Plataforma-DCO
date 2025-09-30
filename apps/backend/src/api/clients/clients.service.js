// Ubicación: DCO/apps/backend/src/api/clients/clients.service.js

const db = require('../../services/pg.service');

const getAllClients = async (page = 1, limit = 8) => {
  const offset = (page - 1) * limit;
  const clientsQuery = db.query(
    'SELECT * FROM clients ORDER BY name ASC LIMIT $1 OFFSET $2',
    [limit, offset]
  );
  const countQuery = db.query('SELECT COUNT(*) FROM clients');
  const [clientsResult, countResult] = await Promise.all([clientsQuery, countQuery]);
  return {
    clients: clientsResult.rows,
    totalClients: parseInt(countResult.rows[0].count, 10),
  };
};

const createClient = async (clientData) => {
  const { name, contact_person, contact_email } = clientData;
  const query = `
    INSERT INTO clients (name, contact_person, contact_email)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const values = [name, contact_person, contact_email];
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateClient = async (id, clientData) => {
  const { name, contact_person, contact_email, is_active } = clientData;
  const query = `
    UPDATE clients
    SET name = $1, contact_person = $2, contact_email = $3, is_active = $4, updated_at = current_timestamp
    WHERE id = $5
    RETURNING *;
  `;
  const values = [name, contact_person, contact_email, is_active, id];
  const result = await db.query(query, values);
  return result.rows[0];
};

const deleteClient = async (id) => {
  const query = 'DELETE FROM clients WHERE id = $1 RETURNING *;';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllClients,
  createClient,
  updateClient,
  deleteClient,
};