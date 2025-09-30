// Ubicación: DCO/apps/backend/migrations/1757536846573_create-creatives-table.js
exports.up = (pgm) => {
  pgm.createTable('creatives', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    campaign_id: {
      type: 'uuid',
      notNull: true,
      references: 'campaigns(id)', // Clave foránea que la vincula a una campaña
      onDelete: 'CASCADE', // Si se borra una campaña, se borran sus creatividades
    },
    name: { type: 'varchar(255)', notNull: true },
    // Aquí irían más campos como la URL de la imagen, el texto del titular, etc.
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('creatives');
};