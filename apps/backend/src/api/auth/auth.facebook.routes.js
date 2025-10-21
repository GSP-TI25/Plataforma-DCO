// Ubicación: DCO/apps/backend/src/api/auth/auth.facebook.routes.js
const { Router } = require('express');
const { passport, handleFacebookCallback } = require('./auth.facebook.controller');

const router = Router();

router.get('/facebook', (req, res, next) => {
  const { clientId } = req.query;
  req.session.clientId = clientId;

  passport.authenticate('facebook', { 
    scope: [
      'read_insights', 
      'ads_management', 
      'ads_read',
      'pages_show_list',
      'pages_read_engagement'
    ] 
  })(req, res, next);
});

router.get('/facebook/callback', 
  passport.authenticate('facebook', { 
    failureRedirect: 'http://localhost:3000/dashboard/clients', 
    session: false 
  }),
  handleFacebookCallback
);

module.exports = router;