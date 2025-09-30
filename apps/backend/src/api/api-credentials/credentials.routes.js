// Ubicación: DCO/apps/backend/src/api/api-credentials/credentials.routes.js
const { Router } = require('express');
const controller = require('./credentials.controller');
const verificarToken = require('../../middleware/auth.middleware');
const checkRole = require('../../middleware/rbac.middleware');

const router = Router();
router.use(verificarToken, checkRole(['admin']));

router.get('/client/:clientId', controller.getByClientId);
router.post('/', controller.create);
router.delete('/:id', controller.deleteById);

module.exports = router;