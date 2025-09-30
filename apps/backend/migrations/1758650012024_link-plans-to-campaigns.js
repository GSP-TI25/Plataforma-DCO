// Ubicación: DCO/apps/backend/migrations/1758650012024_link-plans-to-campaigns.js
exports.up = (pgm) => {
  pgm.addColumn('content_plans', {
    // Guardará el ID de la campaña que se cree en Meta (ej. '123456789')
    meta_campaign_id: { type: 'varchar(255)' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('content_plans', 'meta_campaign_id');
};