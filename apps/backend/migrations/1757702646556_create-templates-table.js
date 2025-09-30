// Ubicación: DCO/apps/backend/migrations/1757702646556_create-templates-table.js
exports.up = (pgm) => {
  pgm.createTable('templates', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(255)', notNull: true },
    // jsonb es un tipo de dato especial de PostgreSQL para guardar JSON
    content: { type: 'jsonb', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('templates');
};