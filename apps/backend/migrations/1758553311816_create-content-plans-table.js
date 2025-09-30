// Ubicación: DCO/apps/backend/migrations/1758553311816_create-content-plans-table.js

exports.up = (pgm) => {
  // Creamos un tipo de dato para los estados del plan de contenido
  pgm.createType('plan_status', ['draft', 'pending_approval', 'approved', 'rejected']);

  pgm.createTable('content_plans', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    
    // El nombre que le daremos al plan, ej. "Campaña Verano 2025"
    name: { type: 'varchar(255)', notNull: true },

    // A qué cliente pertenece este plan
    client_id: {
      type: 'uuid',
      notNull: true,
      references: '"clients"(id)',
      onDelete: 'CASCADE',
    },

    // El objetivo simple que introdujo el usuario, ej. "Vender zapatillas"
    objective: { type: 'text' },

    // El estado actual del plan
    status: { type: 'plan_status', notNull: true, default: 'draft' },

    // Aquí guardaremos las ideas, textos e imágenes que genere la IA
    generated_ideas: { type: 'jsonb' },     // Para conceptos de campaña
    generated_copies: { type: 'jsonb' },    // Para titulares, descripciones, etc.
    generated_moodboard: { type: 'jsonb' }, // Para URLs de imágenes conceptuales

    // El token único para el portal de aprobación del cliente
    approval_token: { type: 'varchar(255)', unique: true },

    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('content_plans');
  pgm.dropType('plan_status');
};