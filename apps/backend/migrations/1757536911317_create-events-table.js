// Ubicación: DCO/apps/backend/migrations/1757536911317_create-events-table.js
exports.up = (pgm) => {
  pgm.createType('event_type', ['click', 'conversion']); // Tipo de evento

  pgm.createTable('events', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    creative_id: {
      type: 'uuid',
      notNull: true,
      references: 'creatives(id)', // Vinculado a una creatividad específica
      onDelete: 'CASCADE',
    },
    type: { type: 'event_type', notNull: true },
    event_time: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('events');
  pgm.dropType('event_type');
};