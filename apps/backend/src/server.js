//Ubicacion: DCO/apps/backend/src/server.js

const express = require('express');
const config = require('./config'); // Usamos nuestra nueva configuración
const db = require('./services/pg.service'); // Importamos el servicio de DB
const cors = require('cors');
const session = require('express-session'); 
const { passport: facebookPassport } = require('./api/auth/auth.facebook.controller'); // Renombrar para evitar conflicto

const errorHandler = require('./middleware/errorHandler.middleware');

const assetRoutes = require('./api/assets/assets.routes');
const authRoutes = require('./api/auth/auth.routes');
const dashboardRoutes = require('./api/dashboard/dashboard.routes');
const campaignRoutes = require('./api/campaigns/campaigns.routes');
const creativeRoutes = require('./api/creatives/creatives.routes');

const dataSourcesRoutes = require('./api/data_sources/data_sources.routes');
const generatorRoutes = require('./api/generator/generator.routes');
const uploadRoutes = require('./api/uploads/uploads.routes');
const userRoutes = require('./api/users/users.routes');
const clientRoutes = require('./api/clients/clients.routes');
const credentialRoutes = require('./api/api-credentials/credentials.routes'); 
const facebookAuthRoutes = require('./api/auth/auth.facebook.routes');
const metaRoutes = require('./api/meta/meta.routes');
const contentPlanRoutes = require('./api/content-plans/plans.routes');
const downloadRoutes = require('./api/download/download.routes');

const app = express();
app.use(express.json()); 
app.use(cors());

// Ruta de salud del API
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', message: 'El API de DCO está funcionando perfectamente.' });
});

// NUEVA RUTA: para probar la conexión a la base de datos
app.get('/api/v1/db-test', async (req, res) => {
  const result = await db.query('SELECT NOW()'); // Hacemos una consulta simple para obtener la hora del servidor de DB
  res.json({
    status: 'ok',
    message: '¡Conexión a la base de datos exitosa!',
    dbTime: result.rows[0].now,
  });
});

app.use(session({
  secret: process.env.JWT_SECRET, // Reutilizamos el JWT secret
  resave: false,
  saveUninitialized: true,
}));
app.use(facebookPassport.initialize()); // Usar el passport renombrado

app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/campaigns', campaignRoutes);
app.use('/api/v1/creatives', creativeRoutes);


app.use('/api/v1/data-sources', dataSourcesRoutes);
app.use('/api/v1/generator', generatorRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/clients', clientRoutes);
app.use('/api/v1/credentials', credentialRoutes);
app.use('/api/v1/meta', metaRoutes);
app.use('/api/v1/content-plans', contentPlanRoutes);
app.use('/api/v1/auth', facebookAuthRoutes);
app.use('/api/v1/download', downloadRoutes);

// Middleware de errores. Debe ser el último middleware que se añade.
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend iniciado y escuchando en el puerto ${PORT}`);
});
