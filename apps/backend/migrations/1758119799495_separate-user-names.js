// Ubicación: DCO/apps/backend/migrations/1758119799495_separate-user-names.js

exports.up = (pgm) => {
  // 1. Añadimos las dos nuevas columnas
  pgm.addColumn('users', {
    first_name: { type: 'varchar(100)' },
    last_name: { type: 'varchar(100)' },
  });

  // 2. (Opcional pero recomendado) Intentamos separar el nombre completo existente
  pgm.sql(`
    UPDATE users SET
    first_name = SPLIT_PART(full_name, ' ', 1),
    last_name = SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1);
  `);

  // 3. Eliminamos la columna antigua
  pgm.dropColumn('users', 'full_name');
};

exports.down = (pgm) => {
  // Hacemos lo inverso para poder revertir
  pgm.addColumn('users', {
    full_name: { type: 'varchar(255)' },
  });
  // (Opcional) Unimos los nombres de nuevo
  pgm.sql("UPDATE users SET full_name = first_name || ' ' || last_name;");
  pgm.dropColumn('users', 'first_name');
  pgm.dropColumn('users', 'last_name');
};