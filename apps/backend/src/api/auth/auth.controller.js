//Ubicacion: DCO/apps/backend/src/api/auth/auth.controller.js

const authService = require('./auth.service');

const register = async (req, res) => {
  try {
    const userData = req.body;

    // Aquí irían validaciones (ej. que el email sea válido, que la contraseña tenga 8 caracteres)
    if (!userData.email || !userData.password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }

    const newUser = await authService.registerUser(userData);
    res.status(201).json(newUser);
  } catch (error) {
    // Manejo de error específico por si el email ya existe (código de error de PG para 'unique violation')
    if (error.code === '23505') {
      return res.status(409).json({ message: 'El correo electrónico ya está registrado.' });
    }
    console.error('Error en register:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const login = async (req, res) => {
  try {
    const credentials = req.body;
    const result = await authService.loginUser(credentials);
    res.status(200).json(result);
  } catch (error) {
    // Si el servicio lanza el error "Credenciales inválidas", respondemos con 401
    res.status(401).json({ message: error.message });
  }
};

module.exports = {
  register,
  login
};