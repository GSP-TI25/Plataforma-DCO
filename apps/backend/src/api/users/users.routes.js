// Ubicación: DCO/apps/backend/src/api/users/users.routes.js

const { Router } = require('express');
const userController = require('./users.controller');
const verificarToken = require('../../middleware/auth.middleware');
const checkRole = require('../../middleware/rbac.middleware');

const router = Router();

// --- ¡NUESTRO DOBLE MURO DE SEGURIDAD! ---
// 1. Todas las rutas en este archivo requieren que el usuario esté logueado.
router.use(verificarToken);
// 2. Y ADEMÁS, requieren que el usuario sea un 'admin'.
router.use(checkRole(['admin']));
// -----------------------------------------

// Ruta para obtener todos los usuarios y crear uno nuevo
router.get('/', userController.getUsers);
router.post('/', userController.createUser);

// Rutas para actualizar y eliminar un usuario específico por su ID
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;