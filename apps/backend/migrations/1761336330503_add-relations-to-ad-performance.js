// Ubicación: DCO/apps/backend/migrations/1761336330503_add-relations-to-ad-performance.js

exports.up = (pgm) => {
  // Añadimos las dos nuevas columnas
  pgm.addColumns('ad_performance', {
    client_id: {
      type: 'uuid',
    },
    campaign_id: {
      type: 'uuid',
    }
  });

  // Creamos índices individuales
  pgm.createIndex('ad_performance', 'client_id');
  pgm.createIndex('ad_performance', 'campaign_id');

  // <<< CORRECCIÓN: Usamos el nombre REAL del índice que encontramos >>>
  // Primero, eliminamos el índice único viejo usando su nombre exacto
  pgm.sql('DROP INDEX IF EXISTS ad_performance_ad_id_platform_platform_report_date_unique_index;');
  
  // Creamos el nuevo índice único que incluye las nuevas columnas
  pgm.createIndex('ad_performance', 
    ['ad_id_platform', 'platform', 'report_date', 'client_id', 'campaign_id'], 
    { unique: true }
  );
};

exports.down = (pgm) => {
  // Para revertir, hacemos los pasos en orden inverso

  // Eliminar el nuevo índice único
  pgm.dropIndex('ad_performance', ['ad_id_platform', 'platform', 'report_date', 'client_id', 'campaign_id']);

  // <<< CORRECCIÓN: Recreamos el índice único viejo (si lo borramos en 'up') >>>
  // Opcional: Podrías querer recrearlo con su nombre original si el 'up' fue exitoso
  // pgm.sql('CREATE UNIQUE INDEX ad_performance_ad_id_platform_platform_report_date_unique_index ON ad_performance (ad_id_platform, platform, report_date);');
  // Por simplicidad ahora, podemos omitir recrearlo en el 'down' si no es estrictamente necesario para ti

  // Eliminar los índices individuales
  pgm.dropIndex('ad_performance', 'campaign_id');
  pgm.dropIndex('ad_performance', 'client_id');

  // Eliminar las columnas
  pgm.dropColumns('ad_performance', ['campaign_id', 'client_id']);
};