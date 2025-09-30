//Ubicacion: DCO/apps/backend/src/services/download.service.js
const axios = require('axios');

// Esta función descarga una imagen de una URL y la devuelve como un 'buffer' (un bloque de datos binarios)
const downloadImageAsBuffer = async (imageUrl) => {
  const response = await axios({
    url: imageUrl,
    method: 'GET',
    responseType: 'arraybuffer' // ¡Esto es clave! Le decimos que espere datos binarios.
  });
  return response.data;
};

module.exports = {
  downloadImageAsBuffer,
};