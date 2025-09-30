// Ubicacion: DCO/apps/backend/src/api/dashboard/dashboard.routes.js

const { Router } = require('express');
const dashboardController = require('./dashboard.controller');
const verificarToken = require('../../middleware/auth.middleware');

const router = Router();

// Ponemos al "guardia" a vigilar.
router.use(verificarToken);

// Rutas protegidas
router.get('/metrics', dashboardController.getMetrics);
router.get('/performance', dashboardController.getPerformance);

module.exports = router;