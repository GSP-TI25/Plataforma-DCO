// Ubicacion: DCO/apps/backend/src/api/generator/generator.routes.js

'use strict';
const { Router } = require('express');
const generatorController = require('./generator.controller');
const verificarToken = require('../../middleware/auth.middleware');

const router = Router();

// Ponemos al "guardia" a vigilar todas las rutas de este archivo
router.use(verificarToken);

// Ruta para generar una creatividad
router.post('/', generatorController.generate);

module.exports = router;