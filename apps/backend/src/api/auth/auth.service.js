//Ubicacion: DCO/apps/backend/src/api/auth/auth.service.js

const db = require('../../services/pg.service');
const bcrypt = require('bcryptjs'); // Importamos bcrypt
const jwt = require('jsonwebtoken');

const registerUser = async (userData) => {
  const { email, password, firstName, lastName } = userData;
  const hashedPassword = await bcrypt.hash(password, 10);
  const query = `
    INSERT INTO users (email, password, first_name, last_name)
    VALUES ($1, $2, $3, $4)
    RETURNING id, email, first_name, last_name, role, created_at; // Cambiado
  `;
  const values = [email, hashedPassword, firstName, lastName]; 
  const result = await db.query(query, values);
  return result.rows[0];
};

const loginUser = async (credentials) => {
  const { email, password } = credentials;

  // 1. Buscar al usuario por su email
  const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = userResult.rows[0];

  if (!user) {
    // Si no se encuentra el usuario, lanzamos un error
    throw new Error('Credenciales inválidas');
  }

  // 2. Comparar la contraseña enviada con el hash guardado en la DB
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    // Si las contraseñas no coinciden, lanzamos un error
    throw new Error('Credenciales inválidas');
  }

  // 3. Si todo es correcto, crear el token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, first_name: user.first_name }, // <-- Asegúrate que sea first_name
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  // Devolvemos los datos del usuario (sin la contraseña) y el token
  delete user.password;
  return { user, token };
};

module.exports = {
  registerUser,
  loginUser
};