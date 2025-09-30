// Ubicación: DCO/apps/backend/src/config/index.js

// Le decimos a dotenv que busque el archivo .env en la misma carpeta
require('dotenv').config(); 

// Exportamos la configuración para que esté disponible en toda la app
module.exports = {
  // Configuración de la Base de Datos
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  },
  // Puerto del Backend
  port: process.env.BACKEND_PORT || 8080,

  // --- ¡LA LÍNEA QUE FALTABA! ---
  // Ahora la configuración también incluye el secreto del token
  jwtSecret: process.env.JWT_SECRET,
};