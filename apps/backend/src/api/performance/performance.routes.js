// Ubicación: DCO/apps/backend/src/api/performance/performance.routes.js

const { Router } = require('express');
const controller = require('./performance.controller');
const verificarToken = require('../../middleware/auth.middleware');
const checkRole = require('../../middleware/rbac.middleware');

const router = Router();

router.use(verificarToken); 

router.post('/sync/meta', checkRole(['admin']), controller.triggerMetaSync);
router.post('/seed-test-data', checkRole(['admin']), controller.seedTestData);
router.get('/report', controller.getReport);

module.exports = router;