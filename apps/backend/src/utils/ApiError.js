//Ubicacion: DCO/apps/backend/src/utils/ApiError.js
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Para distinguir errores operacionales de bugs

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
