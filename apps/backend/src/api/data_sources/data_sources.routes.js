//Ubicacion: DCO/apps/backend/src/api/data_sources/data_sources.routes.js

const { Router } = require('express');
const dataSourceController = require('./data_sources.controller');
const verificarToken = require('../../middleware/auth.middleware');

const router = Router();

// Ponemos al "guardia" a vigilar.
router.use(verificarToken);

// Rutas protegidas
router.get('/', dataSourceController.getDataSources);
router.post('/', dataSourceController.createDataSource);

module.exports = router;