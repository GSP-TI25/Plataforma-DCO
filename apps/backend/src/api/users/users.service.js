// Ubicación: DCO/apps/backend/src/api/users/users.service.js

const db = require('../../services/pg.service');
const bcrypt = require('bcryptjs');

/**
 * Obtiene todos los usuarios de la base de datos, excluyendo sus contraseñas.
 */
const getAllUsers = async (page = 1, limit = 8, searchTerm = '') => {
  const offset = (page - 1) * limit;
  
  let fromClause = 'FROM users';
  let whereClause = '';

  // Parámetros para la consulta de conteo
  const countQueryParams = [];
  let countParamIndex = 1;

  // Parámetros para la consulta de usuarios
  const usersQueryParams = [];
  let usersParamIndex = 1;

  if (searchTerm) {
    // Buscamos en el nombre completo (concatenado) O en el email
    whereClause = ` WHERE (first_name || ' ' || last_name) ILIKE $${countParamIndex++} OR email ILIKE $${countParamIndex++}`;
    countQueryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);

    usersQueryParams.push(`%${searchTerm}%`, `%${searchTerm}%`);
    whereClause = ` WHERE (first_name || ' ' || last_name) ILIKE $${usersParamIndex++} OR email ILIKE $${usersParamIndex++}`;
  }

  const countQueryString = `SELECT COUNT(*) ${fromClause}${whereClause}`;
  const countQuery = db.query(countQueryString, countQueryParams);

  usersQueryParams.push(limit, offset);
  const usersQueryString = `SELECT id, email, first_name, last_name, role, created_at ${fromClause}${whereClause} ORDER BY created_at DESC LIMIT $${usersParamIndex++} OFFSET $${usersParamIndex++}`;
  const usersQuery = db.query(usersQueryString, usersQueryParams);

  const [usersResult, countResult] = await Promise.all([usersQuery, countQuery]);

  return {
    users: usersResult.rows,
    totalUsers: parseInt(countResult.rows[0].count, 10),
  };
};


/**
 * Crea un nuevo usuario. Esta función es similar a la de registro,
 * pero la mantenemos separada por si en el futuro un admin necesita crear usuarios
 * con más o menos campos que un registro normal.
 * @param {object} userData - Datos del usuario (email, password, fullName, role)
 */
const createUser = async (userData) => {
  const { email, password, firstName, lastName, role } = userData;

  const hashedPassword = await bcrypt.hash(password, 10);

   const query = `
    INSERT INTO users (email, password, first_name, last_name, role)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, email, first_name, last_name, role, created_at;
  `;
  const values = [email, hashedPassword, firstName, lastName, role];
  const result = await db.query(query, values);
  return result.rows[0];
};

/**
 * Actualiza los datos de un usuario existente por su ID.
 * @param {string} id - El UUID del usuario a actualizar.
 * @param {object} userData - Los datos a actualizar (fullName, role).
 */
const updateUser = async (id, userData) => {
  const { firstName, lastName, role } = userData;

  const query = `
    UPDATE users
    SET first_name = $1, last_name = $2, role = $3, updated_at = current_timestamp
    WHERE id = $4
    RETURNING id, email, first_name, last_name, role, updated_at; // Cambiado
  `;
  const values = [firstName, lastName, role, id];
  const result = await db.query(query, values);
  return result.rows[0];
};

/**
 * Elimina un usuario de la base de datos por su ID.
 * @param {string} id - El UUID del usuario a eliminar.
 */
const deleteUser = async (id) => {
  const query = 'DELETE FROM users WHERE id = $1 RETURNING id, email;';
  const result = await db.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
};