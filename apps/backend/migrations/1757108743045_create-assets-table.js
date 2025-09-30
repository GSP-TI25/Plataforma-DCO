// Ubicación: DCO/apps/backend/migrations/1757108743045_create-assets-table.js

exports.up = (pgm) => {
  // Esta función se ejecuta cuando corremos la migración hacia "arriba" (up)
  pgm.createTable('assets', {
    // Columna para el ID: será un identificador único universal (UUID)
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'), // PostgreSQL genera el ID automáticamente
    },
    // Columna para el nombre del archivo
    file_name: {
      type: 'varchar(255)',
      notNull: true,
    },
    // Columna para la URL donde se guardará el archivo
    url: {
      type: 'text',
      notNull: true,
      unique: true,
    },
    // Columna para el tipo de archivo (ej. 'image/jpeg', 'video/mp4')
    file_type: {
      type: 'varchar(50)',
      notNull: true,
    },
    // Columna para el tamaño del archivo en bytes
    size_bytes: {
      type: 'integer',
      notNull: true,
    },
    // Columnas automáticas para saber cuándo se creó y actualizó el registro
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
  // Esta función se ejecuta si necesitamos revertir la migración
  pgm.dropTable('assets');
};