// Ubicación: DCO/apps/backend/src/api/dashboard/dashboard.service.js

const db = require('../../services/pg.service');

const getDashboardMetrics = async () => {
  // 1. Definimos las 4 consultas que necesitamos
  const activeCampaignsQuery = db.query("SELECT COUNT(*) FROM campaigns WHERE status = 'active';");
  const creativeVariationsQuery = db.query("SELECT COUNT(*) FROM creatives;");
  const clicksQuery = db.query("SELECT COUNT(*) FROM events WHERE type = 'click';");
  const conversionsQuery = db.query("SELECT COUNT(*) FROM events WHERE type = 'conversion';");

  // 2. Usamos Promise.all para ejecutar todas las consultas en paralelo
  // Esto es mucho más rápido que ejecutarlas una por una.
  const results = await Promise.all([
    activeCampaignsQuery,
    creativeVariationsQuery,
    clicksQuery,
    conversionsQuery,
  ]);

  // 3. Extraemos el resultado de cada consulta
  const activeCampaigns = results[0].rows[0].count;
  const creativeVariations = results[1].rows[0].count;
  const clicks = results[2].rows[0].count;
  const conversions = results[3].rows[0].count;

  // 4. Devolvemos el objeto completo con los datos reales
  return {
    activeCampaigns: activeCampaigns,
    creativeVariations: creativeVariations,
    clicks: clicks,
    conversions: conversions,
  };
};

const getPerformanceData = async () => {
  // Por ahora, generaremos datos de ejemplo. En el futuro, esto sería una consulta SQL compleja.
  const data = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);

    // Formateamos la fecha a "Mes Día", ej: "Sep 04"
    const dayName = date.toLocaleDateString('es-PE', { month: 'short', day: 'numeric' });

    // Generamos datos aleatorios
    const clicks = Math.floor(Math.random() * (500 - 100 + 1) + 100);
    const conversions = Math.floor(clicks * (Math.random() * (0.4 - 0.1) + 0.1));

    data.push({ name: dayName, Clics: clicks, Conversiones: conversions });
  }
  return data;
};

module.exports = {
  getDashboardMetrics,
  getPerformanceData, // <-- Exportamos la nueva función
};