// Ubicación: DCO/apps/backend/src/middleware/auth.middleware.js

const jwt = require('jsonwebtoken');
const config = require('../config');

const verificarToken = (req, res, next) => {
  // Obtenemos el token de la cabecera 'Authorization'
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(403).json({ message: 'Acceso denegado. No se proporcionó un token.' });
  }

  // El token viene en el formato "Bearer <token>", nos quedamos solo con el token
  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: 'Acceso denegado. Formato de token inválido.' });
  }

  try {
    // Verificamos el token usando el secreto que tenemos en nuestra configuración
    const decoded = jwt.verify(token, config.jwtSecret);
    
    // (Opcional) Podríamos adjuntar los datos del usuario a la petición para usarla más adelante
    req.usuario = decoded;

    // Si todo es correcto, continuamos a la siguiente función (el controlador de la ruta)
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
};

module.exports = verificarToken;
