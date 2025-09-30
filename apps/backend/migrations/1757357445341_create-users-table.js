// Ubicacion: DCO/apps/backend/migrations/1757357445341_create-users-table.js
exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true, // No puede haber dos usuarios con el mismo email
    },
    password: {
      type: 'text', // Guardaremos el hash de la contraseña, que es un texto largo
      notNull: true,
    },
    full_name: {
      type: 'varchar(255)',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};