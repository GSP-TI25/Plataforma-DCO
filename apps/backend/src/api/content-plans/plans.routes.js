// Ubicacion: DCO/apps/backend/src/api/content-plans/plans.routes.js

const { Router } = require('express');
const controller = require('./plans.controller');
const verificarToken = require('../../middleware/auth.middleware');

const router = Router();

// --- RUTAS PÚBLICAS (para el portal del cliente) ---
router.get('/approve/:token', controller.getByApprovalToken);
router.patch('/approve/:token/status', controller.updateStatusByToken);


// --- RUTAS PRIVADAS (para el dashboard de la agencia) ---
// Protegemos todas las rutas que vienen después de esta línea
router.use(verificarToken);

router.get('/client/:clientId', controller.getByClientId);
router.post('/', controller.create);
router.get('/:planId', controller.getById);
router.put('/:planId', controller.update);
router.patch('/:planId/status', controller.updateStatus);
router.delete('/:planId', controller.deleteById);
router.post('/:planId/generate-copies', controller.generateCopiesForPlan);
router.post('/:planId/generate-image', controller.generateImageForPlan);
router.post('/:planId/create-meta-campaign', controller.createMetaCampaignFromPlan);
router.get('/by-campaign/:metaCampaignId', controller.getByMetaCampaignId);

module.exports = router;