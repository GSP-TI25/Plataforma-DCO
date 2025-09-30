// Ubicación: DCO/apps/backend/src/api/campaigns/campaigns.routes.js

const { Router } = require('express');
const campaignController = require('./campaigns.controller');
const verificarToken = require('../../middleware/auth.middleware'); 

const router = Router();

// --- 2. Ponemos al guardia a vigilar TODAS las rutas de campañas ---
router.use(verificarToken); 
// --------------------------------------------------------------------

// Rutas para colecciones (ej. /campaigns)
router.get('/', campaignController.getCampaigns);
router.post('/', campaignController.createCampaign);

// Rutas para un recurso específico (ej. /campaigns/un-id-especifico)
router.get('/:id', campaignController.getCampaignById);
router.put('/:id', campaignController.updateCampaign);
router.delete('/:id', campaignController.deleteCampaign);

module.exports = router;