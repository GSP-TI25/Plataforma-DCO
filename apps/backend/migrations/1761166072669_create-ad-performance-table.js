// Ubicación: DCO/apps/backend/migrations/1761166072669_create-ad-performance-table.js

// Usaremos el mismo enum 'platform_name' que ya creamos para las credenciales.

exports.up = (pgm) => {
  pgm.createTable('ad_performance', {
    id: { 
      type: 'uuid', 
      primaryKey: true, 
      default: pgm.func('gen_random_uuid()') 
    },
    // El ID que el anuncio tiene en Meta, Google, TikTok, etc.
    ad_id_platform: { 
      type: 'varchar(255)', 
      notNull: true 
    }, 
    platform: { 
      type: 'platform_name', // Reutilizamos el tipo existente
      notNull: true 
    },
    // La fecha a la que corresponden estas métricas
    report_date: { 
      type: 'date', 
      notNull: true 
    }, 
    impressions: { 
      type: 'integer', 
      notNull: true, 
      default: 0 
    },
    clicks: { 
      type: 'integer', 
      notNull: true, 
      default: 0 
    },
    // Usamos 'numeric' para guardar dinero con precisión decimal
    spend: { 
      type: 'numeric(10, 2)', // 10 dígitos en total, 2 después del punto decimal
      notNull: true, 
      default: 0.00 
    }, 
    // Las conversiones y reacciones pueden no estar siempre disponibles
    conversions: { 
      type: 'integer', 
      default: null 
    }, 
    reactions: { // Nombre genérico para likes, shares, etc.
      type: 'integer', 
      default: null 
    }, 
    created_at: { 
      type: 'timestamp', 
      notNull: true, 
      default: pgm.func('current_timestamp') 
    },
  });

  // Creamos un índice compuesto para buscar rápidamente por anuncio, plataforma y fecha
  // y asegurarnos de que no haya entradas duplicadas para el mismo anuncio en el mismo día.
  pgm.createIndex('ad_performance', ['ad_id_platform', 'platform', 'report_date'], { unique: true });
};

exports.down = (pgm) => {
  pgm.dropTable('ad_performance');
  // No necesitamos borrar el tipo 'platform_name' porque lo usan otras tablas.
};