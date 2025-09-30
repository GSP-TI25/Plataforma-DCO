// Ubicación: DCO/apps/backend/migrations/1758050780739_add-role-to-users.js

exports.up = (pgm) => {
  // 1. Creamos un tipo de dato personalizado para los roles
  pgm.createType('user_role', ['admin', 'moderador', 'diseñador', 'redactor', 'analista']);

  // 2. Añadimos la columna 'role' a la tabla 'users'
  pgm.addColumn('users', {
    role: {
      type: 'user_role',
      notNull: true,
      default: 'diseñador', // Por defecto, los nuevos usuarios serán diseñadores
    },
  });
};

exports.down = (pgm) => {
  // Para revertir, hacemos los pasos en orden inverso
  pgm.dropColumn('users', 'role');
  pgm.dropType('user_role');
};