// Ubicacion: DCO/apps/backend/src/api/dashboard/dashboard.controller.js

const dashboardService = require('./dashboard.service');

const getMetrics = async (req, res) => {
  try {
    const metrics = await dashboardService.getDashboardMetrics();
    res.status(200).json(metrics);
  } catch (error) {
    console.error('Error en getMetrics:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const getPerformance = async (req, res) => {
  try {
    const data = await dashboardService.getPerformanceData();
    res.status(200).json(data);
  } catch (error) {
    console.error('Error en getPerformance:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = {
  getMetrics,
  getPerformance, // <-- Exportamos la nueva función
};