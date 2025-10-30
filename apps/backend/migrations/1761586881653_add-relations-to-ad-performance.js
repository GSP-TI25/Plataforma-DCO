// Ubicación: DCO/apps/backend/migrations/1761586881653_add-relations-to-ad-performance.js

exports.up = (pgm) => {
  // 1. Añadimos las dos nuevas columnas
  pgm.addColumns('ad_performance', {
    client_id: {
      type: 'uuid',
    },
    campaign_id: {
      type: 'uuid',
    }
  });

  // 2. Creamos índices individuales para búsquedas rápidas
  pgm.createIndex('ad_performance', 'client_id');
  pgm.createIndex('ad_performance', 'campaign_id');

  // 3. Eliminamos el índice único viejo usando el nombre CORRECTO
  // (Este era el nombre que encontramos con la consulta a pg_indexes)
  pgm.sql('DROP INDEX IF EXISTS "ad_performance_ad_id_platform_platform_report_date_unique_index";');
  
  // 4. Creamos el nuevo índice único que incluye las nuevas columnas
  pgm.createIndex('ad_performance', 
    ['ad_id_platform', 'platform', 'report_date', 'client_id', 'campaign_id'], 
    { unique: true }
  );
};

exports.down = (pgm) => {
  // Para revertir, hacemos los pasos en orden inverso

  // 1. Eliminar el nuevo índice único
  pgm.dropIndex('ad_performance', ['ad_id_platform', 'platform', 'report_date', 'client_id', 'campaign_id']);

  // 2. Recrear el índice único viejo (opcional, pero buena práctica)
  pgm.sql('CREATE UNIQUE INDEX "ad_performance_ad_id_platform_platform_report_date_unique_index" ON "ad_performance" ("ad_id_platform", "platform", "report_date");');
  
  // 3. Eliminar los índices individuales
  pgm.dropIndex('ad_performance', 'campaign_id');
  pgm.dropIndex('ad_performance', 'client_id');

  // 4. Eliminar las columnas
  pgm.dropColumns('ad_performance', ['campaign_id', 'client_id']);
};