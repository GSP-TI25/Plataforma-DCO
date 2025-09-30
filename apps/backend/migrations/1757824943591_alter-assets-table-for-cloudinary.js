//Ubicacion: DCO/apps/backend/migrations/1757824943591_alter-assets-table-for-cloudinary.js
exports.up = pgm => {
  // Cambiamos el nombre de la columna 'url' por 'cloudinary_url' para más claridad
  pgm.renameColumn('assets', 'url', 'cloudinary_url');
};
exports.down = pgm => {
  pgm.renameColumn('assets', 'cloudinary_url', 'url');
};