// Ubicación: DCO/apps/backend/src/jobs/performance.job.js

const cron = require('node-cron');
const performanceService = require('../services/performance.service');

// Variable para asegurar que la tarea no se ejecute si la anterior aún no ha terminado
let isSyncRunning = false;

// Programar la tarea para que se ejecute todos los días a las 3:00 AM
// El formato cron es: segundo minuto hora día-del-mes mes día-de-la-semana
// '0 3 * * *' significa: al minuto 0, de la hora 3, cualquier día del mes, cualquier mes, cualquier día de la semana.
const syncJob = cron.schedule('0 3 * * *', async () => {
  console.log(`⏰ Cron Job: Ejecutando syncMetaPerformanceData a las ${new Date().toLocaleTimeString()}`);
  
  if (isSyncRunning) {
    console.log('⚠️ Cron Job: La sincronización anterior sigue en curso. Saltando esta ejecución.');
    return;
  }

  isSyncRunning = true;
  try {
    await performanceService.syncMetaPerformanceData();
  } catch (error) {
    console.error('💥 Cron Job: Error no capturado durante la ejecución del job:', error);
  } finally {
    isSyncRunning = false;
    console.log(`🏁 Cron Job: syncMetaPerformanceData finalizado.`);
  }
}, {
  scheduled: false, // No iniciar automáticamente al crear, lo haremos desde server.js
  timezone: "America/Lima" // Asegúrate de usar tu zona horaria correcta
});

// Función para iniciar el job
const start = () => {
  console.log('⏳ Iniciando el job de sincronización de rendimiento...');
  syncJob.start();
};

module.exports = { start };