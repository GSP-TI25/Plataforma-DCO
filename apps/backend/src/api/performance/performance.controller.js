// Ubicación: DCO/apps/backend/src/api/performance/performance.controller.js

const performanceService = require('../../services/performance.service');

const triggerMetaSync = async (req, res, next) => {
  try {
    // Ejecutamos la función de sincronización. 
    // Usamos 'await' para esperar a que termine antes de responder.
    await performanceService.syncMetaPerformanceData(); 
    
    // Respondemos al frontend que la tarea se completó (o al menos se inició sin error inmediato)
    res.status(200).json({ message: 'Sincronización de rendimiento de Meta iniciada manualmente.' });
  } catch (error) {
    // Si algo falla catastróficamente al iniciar, pasamos el error al manejador global
    next(error); 
  }
};

const getReport = async (req, res, next) => {
  try {
    // Los filtros vendrán como query parameters (ej. /report?startDate=2025-10-01)
    const filters = req.query; 
    const reportData = await performanceService.getPerformanceReport(filters);
    res.status(200).json(reportData);
  } catch (error) {
    next(error);
  }
}

const seedTestData = async (req, res, next) => {
  try {
    const result = await performanceService.generateTestData();
    res.status(200).json({ message: 'Generación de datos de prueba completada.', details: result });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  triggerMetaSync,
  getReport,
  seedTestData,
};