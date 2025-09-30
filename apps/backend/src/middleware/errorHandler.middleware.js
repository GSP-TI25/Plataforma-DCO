// Ubicación: DCO/apps/backend/src/middleware/errorHandler.middleware.js

const errorHandler = (err, req, res, next) => {
  // Guardamos el error en consola para debugging
  console.error('ERROR CAPTURADO:', err);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Ocurrió un error inesperado en el servidor.';

  res.status(statusCode).json({
    message: message,
  });
};

module.exports = errorHandler;
