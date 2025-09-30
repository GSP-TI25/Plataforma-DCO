//Ubicacion; DCO/apps/backend/src/api/assets/assets.service.js
const db = require('../../services/pg.service');

const getAllAssets = async () => {
  const result = await db.query('SELECT * FROM assets ORDER BY created_at DESC');
  return result.rows;
};

// --- NUEVA FUNCIÓN ---
const createAsset = async (assetData) => {
  const { file_name, cloudinary_url, file_type, size_bytes } = assetData;
  const query = `
    INSERT INTO assets (file_name, cloudinary_url, file_type, size_bytes)
    VALUES ($1, $2, $3, $4) RETURNING *;
  `;
  const values = [file_name, cloudinary_url, file_type, size_bytes];
  const result = await db.query(query, values);
  return result.rows[0];
};

const updateAsset = async (id, assetData) => {
  const { file_name } = assetData; // Obtenemos el nuevo nombre del archivo

  const query = `
    UPDATE assets
    SET file_name = $1, updated_at = current_timestamp
    WHERE id = $2
    RETURNING *;
  `;
  const values = [file_name, id];
  const result = await db.query(query, values);
  return result.rows[0]; // Devolvemos el asset actualizado
};

const deleteAsset = async (id) => {
  const query = 'DELETE FROM assets WHERE id = $1 RETURNING *;';
  // RETURNING * nos devuelve el objeto que acabamos de borrar, para confirmación.

  const values = [id];
  const result = await db.query(query, values);
  return result.rows[0]; // Devolvemos el asset que fue eliminado
};

module.exports = {
  getAllAssets,
  createAsset,
  updateAsset,
  deleteAsset
};