// Ubicación: DCO/apps/backend/migrations/1758215833278_create-api-credencials-table.js

exports.up = (pgm) => {
  pgm.createType('platform_name', ['meta', 'google', 'tiktok']); // Lista de plataformas soportadas

  pgm.createTable('api_credentials', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    
    // Conexión con la tabla de clientes
    client_id: {
      type: 'uuid',
      notNull: true,
      references: '"clients"(id)', // Clave foránea que lo une a un cliente
      onDelete: 'CASCADE', // Si se borra un cliente, se borran sus credenciales
    },

    // Información de la plataforma
    platform: { type: 'platform_name', notNull: true },

    // El token de acceso que nos da la API
    // NOTA: En un entorno de producción real, este campo DEBE estar encriptado.
    // Por ahora, lo guardaremos como texto para simplificar el desarrollo.
    access_token: { type: 'text', notNull: true },
    
    // Otros datos útiles que podríamos necesitar
    token_expires_at: { type: 'timestamp' }, // Para saber cuándo renovar el token
    scopes: { type: 'text[]' }, // Para saber qué permisos tenemos (ej. ['ads_read', 'ads_manage'])
    
    // Timestamps estándar
    created_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
    updated_at: { type: 'timestamp', notNull: true, default: pgm.func('current_timestamp') },
  });

  // Creamos un índice para buscar credenciales rápidamente por cliente y plataforma
  pgm.createIndex('api_credentials', ['client_id', 'platform'], { unique: true });
};

exports.down = (pgm) => {
  pgm.dropTable('api_credentials');
  pgm.dropType('platform_name');
};