//Ubicacion: DCO/apps/backend/src/services/pg.service.js

const { Pool } = require('pg');
const config = require('../config');

// Ya no necesitamos esto, ¡lo borramos!
// console.log("--- Intentando conectar con la siguiente configuración: ---");
// console.log(config.db);
// console.log("---------------------------------------------------------");

const pool = new Pool(config.db);

module.exports = {
  query: (text, params) => pool.query(text, params),
};