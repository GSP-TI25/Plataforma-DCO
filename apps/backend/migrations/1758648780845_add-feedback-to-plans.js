// Ubicación: DCO/apps/backend/migrations/1758648780845_add-feedback-to-plans.js
exports.up = (pgm) => {
  pgm.addColumn('content_plans', {
    // Un campo de texto simple para guardar los comentarios del cliente
    client_feedback: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('content_plans', 'client_feedback');
};