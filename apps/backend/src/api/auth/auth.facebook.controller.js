// Ubicación: DCO/apps/backend/src/api/auth/auth.facebook.controller.js
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const facebookService = require('../../services/facebook.service');

// Configuración de la estrategia de Passport
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:8080/api/v1/auth/facebook/callback",
  // Le decimos a Passport que guarde el 'req' para poder acceder al clientId
  passReqToCallback: true 
},
// Esta función se ejecuta cuando Facebook nos devuelve al usuario
async (req, accessToken, refreshToken, profile, done) => {
  try {
    const clientId = req.session.clientId; // Recuperamos el ID del cliente de la sesión
    if (!clientId) {
      return done(new Error('No se encontró el ID del cliente en la sesión.'), null);
    }
    // Obtenemos un token de larga duración
    const longLivedToken = await facebookService.getLongLivedAccessToken(accessToken);
    // Guardamos el token en nuestra base de datos
    await facebookService.saveCredential(clientId, longLivedToken);

    return done(null, profile);
  } catch (err) {
    return done(err, null);
  }
}));

// Controlador para la redirección de vuelta desde Facebook
const handleFacebookCallback = (req, res) => {
  // Una vez que Passport guarda el token, redirigimos al usuario a la página de detalle del cliente
  const clientId = req.session.clientId;
  res.redirect(`http://localhost:3000/dashboard/clients/${clientId}`);
};



module.exports = {
  passport,
  handleFacebookCallback,
};