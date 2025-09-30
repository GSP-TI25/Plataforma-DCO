//Ubicacion: DCO/apps/backend/src/api/data_sources/data_sources.service.js

const db = require('../../services/pg.service');
// Por ahora, solo crearemos las funciones para obtener y crear.
const getAllDataSources = async () => {
  const result = await db.query('SELECT id, name, created_at, data FROM data_sources ORDER BY created_at DESC');
  return result.rows;
};
const createDataSource = async ({ name, data }) => {
  const dataAsString = JSON.stringify(data);
  const query = `INSERT INTO data_sources (name, data) VALUES ($1, $2) RETURNING id, name, created_at, data;`;
  const result = await db.query(query, [name, dataAsString]);
  return result.rows[0];
};
const getDataSourceById = async (id) => {
  const result = await db.query('SELECT * FROM data_sources WHERE id = $1', [id]);
  return result.rows[0];
};

module.exports = { getAllDataSources, createDataSource, getDataSourceById };