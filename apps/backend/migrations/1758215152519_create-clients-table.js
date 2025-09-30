// Ubicación: DCO/apps/backend/migrations/1758215152519_create-clients-table.js
exports.up = (pgm) => {
  pgm.createTable('clients', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(255)', notNull: true },
    contact_person: { type: 'varchar(255)' },
    contact_email: { type: 'varchar(255)' },
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};
exports.down = (pgm) => {
  pgm.dropTable('clients');
};