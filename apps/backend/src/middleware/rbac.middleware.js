// Ubicación: DCO/apps/backend/src/middleware/rbac.middleware.js

// RBAC = Role-Based Access Control (Control de Acceso Basado en Roles)

// Esta función no es un middleware en sí, sino una fábrica que CREA middlewares.
// Acepta un array de roles permitidos.
const checkRole = (rolesPermitidos) => {
  // Y devuelve la función de middleware que usará Express.
  return (req, res, next) => {
    // Ya deberíamos tener los datos del usuario gracias al middleware 'verificarToken'
    const usuario = req.usuario;

    if (!usuario || !usuario.role) {
      return res.status(403).json({ message: 'Acceso denegado. Rol de usuario no encontrado.' });
    }

    // Comprobamos si el rol del usuario está en la lista de roles permitidos para esta ruta
    if (rolesPermitidos.includes(usuario.role)) {
      // Si tiene permiso, lo dejamos pasar a la siguiente función (el controlador)
      next();
    } else {
      // Si no tiene permiso, le denegamos el acceso.
      return res.status(403).json({ message: 'Acceso denegado. No tienes los permisos necesarios.' });
    }
  };
};

module.exports = checkRole;