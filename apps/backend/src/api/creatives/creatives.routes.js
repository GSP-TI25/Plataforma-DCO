//Ubicacion: DCO/apps/backend/src/api/creatives/creatives.routes.js

const { Router } = require('express');
const creativeController = require('./creatives.controller');
const verificarToken = require('../../middleware/auth.middleware');

const router = Router();

// Ponemos al "guardia" a vigilar.
router.use(verificarToken);

// Rutas protegidas
router.get('/', creativeController.getCreatives);
router.post('/', creativeController.createCreative);
router.get('/:id', creativeController.getCreativeById);
router.put('/:id', creativeController.updateCreative);
router.delete('/:id', creativeController.deleteCreative);

module.exports = router;