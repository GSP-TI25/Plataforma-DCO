// Ubicación: DCO/apps/backend/src/api/auth/auth.facebook.routes.js
const { Router } = require('express');
const { passport, handleFacebookCallback } = require('./auth.facebook.controller');

const router = Router();

// Ruta inicial: redirige al usuario a Facebook para que autorice
// El frontend llamará a esta ruta, pasando el ID del cliente
router.get('/facebook', (req, res, next) => {
  const { clientId } = req.query;
  req.session.clientId = clientId; // Guardamos el clientId en la sesión

  passport.authenticate('facebook', { 
    scope: ['read_insights', 'ads_management', 'ads_read'] 
  })(req, res, next);
});

// Ruta Callback: Facebook nos redirige aquí después de la autorización
router.get('/facebook/callback', 
  passport.authenticate('facebook', { 
    failureRedirect: 'http://localhost:3000/dashboard/clients', 
    session: false 
  }),
  handleFacebookCallback
);

module.exports = router;