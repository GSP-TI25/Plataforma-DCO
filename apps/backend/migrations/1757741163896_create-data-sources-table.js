// Ubicación: DCO/apps/backend/migrations/1757741163896_create-data-sources-table.js
exports.up = (pgm) => {
  pgm.createTable('data_sources', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'varchar(255)', notNull: true },
    // jsonb es perfecto para guardar datos estructurados como los de un CSV o Excel
    data: { type: 'jsonb', notNull: true },
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('data_sources');
};