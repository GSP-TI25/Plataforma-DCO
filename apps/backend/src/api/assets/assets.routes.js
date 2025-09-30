//Ubicacion; DCO/apps/backend/src/api/assets/assets.routes.js
const { Router } = require('express');
const assetController = require('./assets.controller');
const verificarToken = require('../../middleware/auth.middleware');

const router = Router();

router.get('/', verificarToken, assetController.getAssets);
router.post('/', verificarToken, assetController.createAsset);
router.put('/:id', verificarToken, assetController.updateAsset);
router.delete('/:id', verificarToken, assetController.deleteAsset);

module.exports = router;