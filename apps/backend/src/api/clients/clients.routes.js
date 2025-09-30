// Ubicación: DCO/apps/backend/src/api/clients/clients.routes.js

const { Router } = require('express');
const clientController = require('./clients.controller');
const verificarToken = require('../../middleware/auth.middleware');
const checkRole = require('../../middleware/rbac.middleware');

const router = Router();

// Protegemos todas las rutas de clientes
router.use(verificarToken);

// Solo los admins pueden gestionar clientes
router.get('/', checkRole(['admin']), clientController.getClients);
router.post('/', checkRole(['admin']), clientController.createClient);
router.put('/:id', checkRole(['admin']), clientController.updateClient);
router.delete('/:id', checkRole(['admin']), clientController.deleteClient);

module.exports = router;