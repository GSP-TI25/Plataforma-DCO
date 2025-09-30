// Ubicación: DCO/apps/backend/migrations/1757535843639_create-campaigns-table.js

exports.up = (pgm) => {
  // Creamos un tipo de dato personalizado para el estado de la campaña
  pgm.createType('campaign_status', ['active', 'paused', 'archived', 'draft']);

  pgm.createTable('campaigns', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    name: {
      type: 'varchar(255)',
      notNull: true,
    },
    status: {
      type: 'campaign_status',
      notNull: true,
      default: 'draft',
    },
    start_date: {
      type: 'timestamp',
    },
    end_date: {
      type: 'timestamp',
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
  pgm.dropTable('campaigns');
  pgm.dropType('campaign_status');
};