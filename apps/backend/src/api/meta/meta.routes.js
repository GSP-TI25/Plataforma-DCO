// Ubicación: DCO/apps/backend/src/api/meta/meta.routes.js
const { Router } = require('express');
const controller = require('./meta.controller');
const verificarToken = require('../../middleware/auth.middleware');
const checkRole = require('../../middleware/rbac.middleware');

const router = Router();
// Protegemos las rutas para que solo los admins logueados puedan usarlas
router.use(verificarToken, checkRole(['admin']));

router.get('/ad-accounts/:clientId', controller.getAdAccountsForClient);
router.get('/clients/:clientId/ad-accounts/:adAccountId/campaigns', controller.getCampaignsForAdAccount);
router.post('/clients/:clientId/ad-accounts/:adAccountId/campaigns', controller.createCampaignForAdAccount);
router.delete('/clients/:clientId/campaigns/:campaignId', controller.deleteCampaignFromMeta);
router.get('/clients/:clientId/campaigns/:campaignId/adsets', controller.getAdSetsForCampaign);
router.post('/clients/:clientId/ad-accounts/:adAccountId/adsets', controller.createAdSetForCampaign);
router.delete('/clients/:clientId/adsets/:adSetId', controller.deleteAdSetFromMeta);
router.get('/clients/:clientId/pages', controller.getPagesForClient);

// Rutas para el nuevo flujo de creación de anuncios completos
router.post('/clients/:clientId/ad-accounts/:adAccountId/images', controller.uploadImageForAdAccount);
router.post('/clients/:clientId/ad-accounts/:adAccountId/creatives', controller.createCreativeForAdAccount);
router.post('/clients/:clientId/ad-accounts/:adAccountId/ads', controller.createAdForAdAccount);


module.exports = router;