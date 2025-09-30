//Ubicacion: DCO/apps/backend/src/api/auth/auth.routes.js

const { Router } = require('express');
const authController = require('./auth.controller');

const router = Router();

// Definimos la ruta para el registro
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;